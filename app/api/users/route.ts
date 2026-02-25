import { NextRequest, NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/app/utils/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";

const USERS_COLLECTION = "users";

export type UserDoc = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET() {
  try {
    const snap = await db
      .collection(USERS_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();
    const users: UserDoc[] = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        email: d.email ?? "",
        displayName: d.displayName ?? "",
        role: d.role ?? "user",
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? "",
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? "",
      };
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

import { requireSuperAdmin } from "./auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireSuperAdmin(req);
    if (!authResult.ok) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const body = await req.json();
    const { email, password, displayName, role = "user" } = body;
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Password is required (min 6 characters)" },
        { status: 400 },
      );
    }
    const authUser = await firebaseAdmin.auth().createUser({
      email: email.trim(),
      password: String(password),
      displayName: (displayName ?? "").trim() || undefined,
    });
    const now = Timestamp.now();
    await db.collection(USERS_COLLECTION).doc(authUser.uid).set({
      id: authUser.uid,
      email: email.trim(),
      displayName: (displayName ?? "").trim(),
      role: (role ?? "user").trim(),
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: authUser.uid });
  } catch (err: unknown) {
    console.error("POST /api/users:", err);
    const msg =
      err && typeof err === "object" && "code" in err
        ? (err as { code: string }).code === "auth/email-already-exists"
          ? "Email already in use"
          : "Failed to create user"
        : "Failed to create user";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
