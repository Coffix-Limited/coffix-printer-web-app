import { NextResponse } from "next/server";

const CLEANUP_URL =
  "https://us-central1-flutter-ai-workspace-803fc.cloudfunctions.net/cleanupLogs";

export async function POST() {
  try {
    const res = await fetch(CLEANUP_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? "Cleanup failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[cleanup-logs proxy] Error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
