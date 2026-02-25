import { NextRequest } from "next/server";
import { db, firebaseAdmin } from "@/app/utils/firebase.admin";

const USERS_COLLECTION = "users";

export async function requireSuperAdmin(
  req: NextRequest
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false, status: 401, error: "Unauthorized" };
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    const userDoc = await db.collection(USERS_COLLECTION).doc(decoded.uid).get();
    const role = userDoc.data()?.role;
    if (role !== "superadmin")
      return { ok: false, status: 403, error: "Superadmin role required" };
    return { ok: true };
  } catch {
    return { ok: false, status: 401, error: "Invalid token" };
  }
}
