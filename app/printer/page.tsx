"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COFFEE_PALETTE } from "../constants/theme";
import { usePrinterStore } from "./store/usePrinterStore";
import { Printer as PrinterIcon, MapPin, Activity, Copy, Download, QrCode, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { Printer } from "./interface/Printer";
import QRCodeReact from "react-qr-code";

export default function PrinterPage() {
  const router = useRouter();
  const { printers, setPrinters, loading, error, deletePrinter, setPrinterVisible } = usePrinterStore();
  const [expandedPrinter, setExpandedPrinter] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");

  const filteredPrinters = printers.filter((p) => {
    const visible = p.isVisible ?? true;
    if (visibilityFilter === "visible") return visible;
    if (visibilityFilter === "hidden") return !visible;
    return true;
  });

  const handleDelete = async (printerId: string) => {
    if (!confirm("Delete this printer? This cannot be undone.")) return;
    setDeletingId(printerId);
    try {
      await deletePrinter(printerId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (printer: Printer) => {
    await setPrinterVisible(printer.id, !(printer.isVisible ?? true));
  };

  useEffect(() => {
    setPrinters();
  }, [setPrinters]);

  const handleDownloadQR = (printerId: string) => {
    const svg = document.getElementById(`qr-code-${printerId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `printer-${printerId}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyMessage("Code copied!");
    setTimeout(() => setCopyMessage(""), 2000);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {copyMessage && (
        <div className="mb-6 p-4 rounded-lg border" style={{
          backgroundColor: COFFEE_PALETTE.cardBg,
          borderColor: COFFEE_PALETTE.success
        }}>
          <p className="text-sm font-medium" style={{ color: COFFEE_PALETTE.success }}>{copyMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3"
          style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.error }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: COFFEE_PALETTE.error }}>
            <span className="text-white text-xs">!</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1" style={{ color: COFFEE_PALETTE.error }}>
              Firebase Connection Error
            </h4>
            <p className="text-sm mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>{error}</p>
            <p className="text-xs opacity-80" style={{ color: COFFEE_PALETTE.textSecondary }}>
              Check browser console or <code className="bg-white/50 px-1 py-0.5 rounded">FIREBASE_SETUP.md</code>
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: "#E8E8E8" }}>
            Printers
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: "#A0AEC0" }}>
            <span>Manage and monitor all printer nodes</span>
            {loading && <span className="animate-pulse text-xs italic">Loading...</span>}
            {!loading && printers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#E8E8E8" }}>
                {filteredPrinters.length} of {printers.length} printer{printers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {!loading && printers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(["all", "visible", "hidden"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setVisibilityFilter(key)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: visibilityFilter === key ? COFFEE_PALETTE.primary : COFFEE_PALETTE.cardBg,
                    color: visibilityFilter === key ? "#FFFFFF" : COFFEE_PALETTE.textPrimary,
                    border: `1px solid ${visibilityFilter === key ? COFFEE_PALETTE.primary : COFFEE_PALETTE.border}`,
                  }}
                >
                  {key === "all" ? "All" : key === "visible" ? "Visible only" : "Hidden only"}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => router.push("/setup")}
          className="px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-90 flex items-center gap-2 shrink-0"
          style={{ backgroundColor: COFFEE_PALETTE.primary, color: COFFEE_PALETTE.cardBg }}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Printer</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: COFFEE_PALETTE.primary }} />
            <p className="text-sm" style={{ color: "#A0AEC0" }}>Loading printers...</p>
          </div>
        </div>
      ) : filteredPrinters.length === 0 ? (
        <div className="p-12 rounded-lg border-2 border-dashed text-center"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}>
          <PrinterIcon className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "#A0AEC0" }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: "#E8E8E8" }}>
            {printers.length === 0 ? "No Printers Found" : "No printers match filter"}
          </h3>
          <p className="text-sm" style={{ color: "#A0AEC0" }}>
            {printers.length === 0
              ? "Add printer documents in Setup page"
              : "Try switching to All or Visible only"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredPrinters.map((printer: Printer) => {
            const coffixCode = printer.uniqueCode ?? "";
            const isVisible = printer.isVisible ?? true;
            return (
              <div
                key={printer.id}
                className="p-5 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: COFFEE_PALETTE.background }}
                    >
                      <PrinterIcon className="w-6 h-6" style={{ color: "#E8E8E8" }} />
                    </div>
                    <div>
                      <p className="text-sm font-mono break-all" style={{ color: COFFEE_PALETTE.textSecondary }}>
                        Printer ID: {printer.id}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2" style={{ color: COFFEE_PALETTE.textSecondary }}>
                          <MapPin className="w-4 h-4" />
                          <span>Location: {printer.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleVisible(printer)}
                      className="p-2 rounded-md transition-opacity hover:opacity-80"
                      style={{ color: isVisible ? COFFEE_PALETTE.primary : COFFEE_PALETTE.textSecondary }}
                      title={isVisible ? "Hide printer" : "Show printer"}
                      aria-label={isVisible ? "Hide printer" : "Show printer"}
                    >
                      {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(printer.id)}
                      disabled={deletingId === printer.id}
                      className="p-2 rounded-md transition-opacity hover:opacity-80 disabled:opacity-50"
                      style={{ color: COFFEE_PALETTE.error }}
                      title="Delete printer"
                      aria-label="Delete printer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {/* <div className="flex items-center gap-1.5">
                                    <Circle 
                                        className="w-2.5 h-2.5 fill-current"
                                        style={{ color: printer.isOnline ? COFFEE_PALETTE.success : COFFEE_PALETTE.error }}
                                    />
                                    <span 
                                        className="text-xs font-medium"
                                        style={{ color: printer.isOnline ? COFFEE_PALETTE.success : COFFEE_PALETTE.error }}
                                    >
                                        {printer.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div> */}
                </div>



                <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: COFFEE_PALETTE.border }}>
                  <button
                    onClick={() => router.push(`/printer/${printer.id}`)}
                    className="w-full py-2 px-4 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: COFFEE_PALETTE.primary,
                      color: '#FFFFFF'
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => setExpandedPrinter(expandedPrinter === printer.id ? null : printer.id)}
                    className="text-white w-full py-2 px-4 rounded-md text-sm font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: COFFEE_PALETTE.background,
                    }}
                  >
                    <QrCode size={16} />
                    {expandedPrinter === printer.id ? 'Hide QR Code' : 'Show QR Code'}
                  </button>

                  {expandedPrinter === printer.id && (
                    <div className="p-4 rounded-lg border" style={{
                      borderColor: COFFEE_PALETTE.border
                    }}>
                      <div className="flex justify-center mb-3">
                        {coffixCode ? (
                          <QRCodeReact
                            id={`qr-code-${printer.id}`}
                            value={coffixCode}
                            size={150}
                            level="H"
                          />
                        ) : (
                          <div className="w-[150px] h-[150px] flex items-center justify-center rounded border-2 border-dashed text-xs text-center px-2"
                            style={{ borderColor: COFFEE_PALETTE.border, color: COFFEE_PALETTE.textSecondary }}>
                            No unique code assigned
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleCopyUrl(coffixCode)}
                          disabled={!coffixCode}
                          className="w-full py-2 px-3 rounded-md text-xs font-medium border transition-opacity hover:opacity-90 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            borderColor: COFFEE_PALETTE.primary,
                            color: COFFEE_PALETTE.primary,
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Copy size={12} />
                          Copy Coffix Code
                        </button>

                        <button
                          onClick={() => handleDownloadQR(printer.id)}
                          className="w-full py-2 px-3 rounded-md text-xs font-medium border transition-opacity hover:opacity-90 flex items-center justify-center gap-1"
                          style={{
                            borderColor: COFFEE_PALETTE.primary,
                            color: COFFEE_PALETTE.primary,
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Download size={12} />
                          Download QR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  );
}