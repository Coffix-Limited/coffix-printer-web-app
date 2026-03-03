"use client"

import { useState, useEffect } from "react";
import { COFFEE_PALETTE } from "../constants/theme";
import { Save, AlertCircle, Printer } from "lucide-react";
import { usePrinterStore } from "../printer/store/usePrinterStore";
import { PrinterService } from "../printer/services/PrinterService";

export default function SetupPage() {
  const [printerId, setPrinterId] = useState("");
  const [label, setLabel] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const { printers, setPrinters } = usePrinterStore();

  useEffect(() => {
    setPrinters();
  }, [setPrinters]);

  const handleSave = async () => {
    if (!printerId?.trim()) {
      setSaveMessage("⚠️ Printer ID is required (e.g. VOS).");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }
    if (!label) {
      setSaveMessage("⚠️ Printer label is required to save.");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      await PrinterService.addPrinter({
        printerId: printerId.trim(),
        label: label,
        location: location || label
      });
      setSaveMessage("✅ Printer saved successfully!");

      setPrinters();

      setTimeout(() => {
        setSaveMessage("");
        setPrinterId("");
        setLabel("");
        setLocation("");
      }, 2000);
    } catch (error) {
      console.error("Failed to save printer:", error);
      setSaveMessage("❌ Failed to save printer. " + (error as Error).message);
      setTimeout(() => setSaveMessage(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>Printer Setup</h2>
        <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
          Register new printers and generate QR codes • {printers.length} printer{printers.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {saveMessage && (
        <div className="mb-6 p-4 rounded-lg border" style={{
          backgroundColor: saveMessage.includes('✅') ? '#E8F5E9' : '#FFEBEE',
          borderColor: saveMessage.includes('✅') ? COFFEE_PALETTE.success : COFFEE_PALETTE.error
        }}>
          <p className="text-sm font-medium">{saveMessage}</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
            <Printer size={20} />
            Printer Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
                Printer ID *
              </label>
              <input
                type="text"
                value={printerId}
                onChange={(e) => setPrinterId(e.target.value)}
                placeholder="e.g. VOS"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{
                  borderColor: COFFEE_PALETTE.border,
                  color: COFFEE_PALETTE.textPrimary
                }}
              />
              <p className="text-xs mt-1" style={{ color: COFFEE_PALETTE.textSecondary }}>Short ID for this printer (different from document ID)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
                Printer Label *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Auckland, Tauranga, Hamilton"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{
                  borderColor: COFFEE_PALETTE.border,
                  color: COFFEE_PALETTE.textPrimary
                }}
              />
              <p className="text-xs mt-1" style={{ color: COFFEE_PALETTE.textSecondary }}>Printer display name</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Auckland City"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{
                  borderColor: COFFEE_PALETTE.border,
                  color: COFFEE_PALETTE.textPrimary
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !printerId?.trim() || !label}
              className="w-full py-3 rounded-md font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: COFFEE_PALETTE.success }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Printer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: COFFEE_PALETTE.warningBg, borderColor: COFFEE_PALETTE.warning }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: COFFEE_PALETTE.warning }} />
          <div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>Setup Instructions</h4>
            <ol className="text-sm space-y-1" style={{ color: COFFEE_PALETTE.textSecondary }}>
              <li>1. Enter Printer ID (e.g. VOS) — short code, different from document ID</li>
              <li>2. Enter printer label/name (e.g., Auckland, Tauranga)</li>
              <li>3. Optional: Set location name</li>
              <li>4. Click &ldquo;Save Printer&rdquo; to register (document ID auto-generated)</li>
              <li>5. Go to Printers page to view and manage printers</li>
              <li>6. Download QR code and display at printer location</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}