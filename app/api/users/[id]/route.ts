import { NextRequest, NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/app/utils/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";
import { requireSuperAdmin } from "../auth";

const USERS_COLLECTION = "users";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await db.collection(USERS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const d = doc.data()!;
    return NextResponse.json({
      id: doc.id,
      email: d.email ?? "",
      displayName: d.displayName ?? "",
      role: d.role ?? "user",
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? "",
      updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? "",
    });
  } catch (err) {
    console.error("GET /api/users/[id]:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireSuperAdmin(req);
    if (!authResult.ok) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { id } = await params;
    const body = await req.json();
    const { email, displayName, role } = body;
    const ref = db.collection(USERS_COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };
    if (email !== undefined) updates.email = String(email).trim();
    if (displayName !== undefined)
      updates.displayName = String(displayName).trim();
    if (role !== undefined) updates.role = String(role).trim();
    await ref.update(updates);
    try {
      const authUpdates: { displayName?: string; email?: string } = {};
      if (displayName !== undefined)
        authUpdates.displayName = String(displayName).trim();
      if (email !== undefined) authUpdates.email = String(email).trim();
      if (Object.keys(authUpdates).length) {
        await firebaseAdmin.auth().updateUser(id, authUpdates);
      }
    } catch {
      // Auth user may not exist for legacy Firestore-only users
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/users/[id]:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireSuperAdmin(req);
    if (!authResult.ok) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { id } = await params;
    const ref = db.collection(USERS_COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await ref.delete();
    try {
      await firebaseAdmin.auth().deleteUser(id);
    } catch {
      // Auth user may not exist for legacy Firestore-only users
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/users/[id]:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
