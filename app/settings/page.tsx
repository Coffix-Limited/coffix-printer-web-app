"use client";

import { useEffect, useState } from "react";
import { COFFEE_PALETTE } from "@/app/constants/theme";
import { useGlobalStore } from "@/app/global/store/useGlobalStore";

export default function SettingsPage() {
  const { global, loading, error, subscribe, cleanup, update } = useGlobalStore();

  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number; cutoffDate: string } | null>(null);
  const [cleanupError, setCleanupError] = useState<string | null>(null);

  useEffect(() => {
    subscribe();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (global) {
      setRetentionDays(global.log_retention_days ?? 7);
    }
  }, [global]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await update({ log_retention_days: retentionDays });
      setSaveMessage("Settings saved.");
    } catch (err) {
      setSaveMessage("Failed to save settings.");
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCleanup = async () => {
    setCleaning(true);
    setCleanupResult(null);
    setCleanupError(null);
    try {
      const res = await fetch("/api/cleanup-logs", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cleanup failed");
      setCleanupResult({ deleted: data.deleted, cutoffDate: data.cutoffDate });
    } catch (err) {
      setCleanupError(err instanceof Error ? err.message : "Cleanup failed");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
        Settings
      </h1>
      <p className="text-sm mb-6" style={{ color: COFFEE_PALETTE.textSecondary }}>
        Global configuration stored in Firestore.
      </p>

      {loading && (
        <p className="text-sm mb-4" style={{ color: COFFEE_PALETTE.textSecondary }}>
          Loading settings…
        </p>
      )}

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{ backgroundColor: "#FFEBEE", color: COFFEE_PALETTE.error }}
        >
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Log Retention Card */}
          <div
            className="rounded-xl border p-6 mb-4"
            style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}
          >
            <h2 className="font-semibold text-base mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>
              Log Retention
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: COFFEE_PALETTE.textSecondary }}>
                Retention Days
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-32 px-3 py-2 rounded-md border text-sm focus:outline-none"
                style={{
                  borderColor: COFFEE_PALETTE.border,
                  color: COFFEE_PALETTE.textPrimary,
                }}
              />
              <p className="text-xs mt-1" style={{ color: COFFEE_PALETTE.textSecondary }}>
                Logs older than this many days will be deleted during cleanup. (Recommended: 7)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !global}
                className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: COFFEE_PALETTE.primary }}
              >
                {saving ? "Saving…" : "Save Settings"}
              </button>
              {saveMessage && (
                <span className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>

          {/* Cleanup Card */}
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}
          >
            <h2 className="font-semibold text-base mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
              Log Cleanup
            </h2>
            <p className="text-sm mb-4" style={{ color: COFFEE_PALETTE.textSecondary }}>
              Manually trigger a cleanup run. This deletes all logs older than the current retention window ({retentionDays} days).
            </p>

            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: cleaning ? COFFEE_PALETTE.textSecondary : COFFEE_PALETTE.error }}
            >
              {cleaning ? "Running cleanup…" : "Run Cleanup Now"}
            </button>

            {cleanupResult && (
              <div
                className="mt-3 rounded-md px-4 py-3 text-sm"
                style={{ backgroundColor: "#E8F5E9", color: COFFEE_PALETTE.success }}
              >
                Deleted <strong>{cleanupResult.deleted}</strong> log{cleanupResult.deleted !== 1 ? "s" : ""} older than{" "}
                {new Date(cleanupResult.cutoffDate).toLocaleDateString()}.
              </div>
            )}

            {cleanupError && (
              <div
                className="mt-3 rounded-md px-4 py-3 text-sm"
                style={{ backgroundColor: "#FFEBEE", color: COFFEE_PALETTE.error }}
              >
                {cleanupError}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
