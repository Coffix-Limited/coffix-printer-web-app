"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrinterStore } from "../store/usePrinterStore";
import { useTemplateStore } from "../../templates/store/useTemplateStore";
import { PrinterService } from "../services/PrinterService";
import { COFFEE_PALETTE } from "../../constants/theme";
import {
    Printer as PrinterIcon,
    MapPin,
    Activity,
    Copy,
    Download,
    ArrowLeft,
    Save,
    AlertCircle,
    Circle,
    FileText,
    Eye,
    EyeOff
} from "lucide-react";
import { Printer } from "../interface/Printer";
import QRCodeReact from "react-qr-code";

export default function PrinterDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const printerId = params.printerId as string;

    const { printers, setPrinters, selectedPrinter, setPrinter, setPrinterVisible, loading: printersLoading } = usePrinterStore();
    const { lineDecorations, setLineDecorations, loading: templatesLoading } = useTemplateStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copyMessage, setCopyMessage] = useState("");
    const [formData, setFormData] = useState({
        id: "",
        location: "",
        templateName: ""
    });

    useEffect(() => {
        setPrinters();
        setLineDecorations();
    }, [setPrinters, setLineDecorations]);

    useEffect(() => {
        if (printerId && printers.length > 0) {
            const foundPrinter: Printer | undefined = printers.find(p => p.id === printerId);
            if (foundPrinter) {
                setPrinter(foundPrinter);
                setFormData({
                    id: foundPrinter.id || "",
                    location: foundPrinter.location || "",
                    templateName: foundPrinter.templateName || ""
                });
            }
        }
    }, [printerId, printers, setPrinter]);

    const handleSave = async () => {
        if (!selectedPrinter) return;

        setIsSaving(true);
        try {
            const updatedPrinter: Printer = {
                ...selectedPrinter,
                location: formData.location,
                templateName: formData.templateName
            };
            await PrinterService.updatePrinter(updatedPrinter);
            setIsEditing(false);
            setPrinter(updatedPrinter);
        } catch (error) {
            console.error("Failed to update printer:", error);
            alert("Failed to update printer");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadQR = () => {
        if (!selectedPrinter) return;
        const svg = document.getElementById(`qr-code-${selectedPrinter.id}`);
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
            downloadLink.download = `printer-${selectedPrinter.id}-qrcode.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopyMessage("URL copied!");
        setTimeout(() => setCopyMessage(""), 2000);
    };

    const isVisible = selectedPrinter?.isVisible ?? true;
    const handleToggleVisible = async () => {
        if (!selectedPrinter) return;
        const next = !isVisible;
        setPrinter({ ...selectedPrinter, isVisible: next });
        await setPrinterVisible(selectedPrinter.id, next);
    };

    if (printersLoading || templatesLoading) {
        return (
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: COFFEE_PALETTE.primary }} />
                        <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>Loading printer details...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!selectedPrinter) {
        return (
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="p-12 rounded-lg border-2 border-dashed text-center"
                    style={{ borderColor: COFFEE_PALETTE.border }}>
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: COFFEE_PALETTE.error }} />
                    <h3 className="text-lg font-semibold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
                        Printer Not Found
                    </h3>
                    <p className="text-sm mb-4" style={{ color: COFFEE_PALETTE.textSecondary }}>
                        The printer with ID &ldquo;{printerId}&rdquo; could not be found.
                    </p>
                    <button
                        onClick={() => router.push("/printer")}
                        className="px-6 py-2 rounded-md font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: COFFEE_PALETTE.primary }}
                    >
                        Back to Printers
                    </button>
                </div>
            </main>
        );
    }

    const qrCode = `https://coffix.co.nz?printerId=${selectedPrinter.id}&templateName=${selectedPrinter.templateName}`;
    const selectedTemplate = lineDecorations.find(t => t.templateName === selectedPrinter.templateName);

    return (
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {copyMessage && (
                <div className="mb-6 p-4 rounded-lg border" style={{
                    backgroundColor: '#E8F5E9',
                    borderColor: COFFEE_PALETTE.success
                }}>
                    <p className="text-sm font-medium">{copyMessage}</p>
                </div>
            )}

            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.push("/printer")}
                    className="p-2 rounded-md transition-opacity hover:opacity-80"
                    style={{ backgroundColor: COFFEE_PALETTE.background }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: COFFEE_PALETTE.primary }} />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
                        Printer Details
                    </h2>
                    <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
                        View and manage printer configuration
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-lg border shadow-sm p-6" style={{
                    backgroundColor: COFFEE_PALETTE.cardBg,
                    borderColor: COFFEE_PALETTE.border
                }}>
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: COFFEE_PALETTE.background }}
                            >
                                <PrinterIcon className="w-8 h-8" style={{ color: COFFEE_PALETTE.primary }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
                                    {isEditing ? "Edit Printer" : selectedPrinter.id}
                                </h3>
                                <p className="text-sm font-mono" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Printer ID: {selectedPrinter.location}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Circle
                                    className="w-3 h-3 fill-current"
                                    style={{ color: selectedPrinter.isOnline ? COFFEE_PALETTE.success : COFFEE_PALETTE.error }}
                                />
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: selectedPrinter.isOnline ? COFFEE_PALETTE.success : COFFEE_PALETTE.error }}
                                >
                                    {selectedPrinter.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <button
                                onClick={handleToggleVisible}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md border transition-opacity hover:opacity-90"
                                style={{
                                    borderColor: COFFEE_PALETTE.border,
                                    backgroundColor: COFFEE_PALETTE.background,
                                    color: isVisible ? COFFEE_PALETTE.primary : COFFEE_PALETTE.textSecondary
                                }}
                                title={isVisible ? "Visible to customers" : "Hidden from customers"}
                            >
                                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                <span className="text-sm font-medium">
                                    {isVisible ? "Visible" : "Hidden"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Printer ID
                                </label>
                                <p className="text-base font-mono" style={{ color: COFFEE_PALETTE.textPrimary }}>{selectedPrinter.id || "—"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Location
                                </label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" style={{ color: COFFEE_PALETTE.textSecondary }} />
                                    <p className="text-base" style={{ color: COFFEE_PALETTE.textPrimary }}>{selectedPrinter.location || "—"}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Print Template
                                </label>
                                <p className="text-base" style={{ color: COFFEE_PALETTE.textPrimary }}>
                                    {selectedTemplate ? `${selectedTemplate.templateName}` : "No template assigned"}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => router.push(`/printer/${printerId}/receipts`)}
                                    className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: COFFEE_PALETTE.secondary,
                                        color: '#FFFFFF'
                                    }}
                                >
                                    <FileText className="w-4 h-4" />
                                    View Receipts
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: COFFEE_PALETTE.primary,
                                        color: '#FFFFFF'
                                    }}
                                >
                                    Edit Printer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Printer ID
                                </label>
                                <input
                                    disabled={true}
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border text-base font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        borderColor: COFFEE_PALETTE.border,
                                        backgroundColor: COFFEE_PALETTE.cardBg,
                                        color: COFFEE_PALETTE.textPrimary
                                    }}
                                    placeholder="e.g. VOS"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border text-base"
                                    style={{
                                        borderColor: COFFEE_PALETTE.border,
                                        backgroundColor: COFFEE_PALETTE.cardBg,
                                        color: COFFEE_PALETTE.textPrimary
                                    }}
                                    placeholder="Enter location"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Print Template
                                </label>
                                <select
                                    value={formData.templateName}
                                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md border text-base"
                                    style={{
                                        borderColor: COFFEE_PALETTE.border,
                                        backgroundColor: COFFEE_PALETTE.cardBg,
                                        color: COFFEE_PALETTE.textPrimary
                                    }}
                                >
                                    {lineDecorations.map((template) => (
                                        <option key={template.id} value={template.templateName}>
                                            {template.templateName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: COFFEE_PALETTE.primary,
                                        color: '#FFFFFF'
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            id: selectedPrinter.id || "",
                                            location: selectedPrinter.location || "",
                                            templateName: selectedPrinter.templateName || ""
                                        });
                                    }}
                                    className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-80"
                                    style={{
                                        backgroundColor: COFFEE_PALETTE.background,
                                        color: COFFEE_PALETTE.textPrimary
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border shadow-sm p-6" style={{
                    backgroundColor: COFFEE_PALETTE.cardBg,
                    borderColor: COFFEE_PALETTE.border
                }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>
                        QR Code & Connection URL
                    </h3>

                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-lg border" style={{
                            backgroundColor: COFFEE_PALETTE.background,
                            borderColor: COFFEE_PALETTE.border
                        }}>
                            <QRCodeReact
                                id={`qr-code-${selectedPrinter?.id || ""}`}
                                value={qrCode}
                                size={200}
                                level="H"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Connection URL
                        </label>
                        <div className="flex items-center gap-2 p-3 rounded-md border font-mono text-sm break-all" style={{
                            backgroundColor: COFFEE_PALETTE.background,
                            borderColor: COFFEE_PALETTE.border,
                            color: COFFEE_PALETTE.textPrimary
                        }}>
                            <span className="flex-1">{qrCode}</span>
                            <button
                                onClick={() => handleCopyUrl(qrCode)}
                                className="p-2 rounded-md transition-opacity hover:opacity-80 shrink-0"
                                style={{ backgroundColor: COFFEE_PALETTE.cardBg }}
                            >
                                <Copy className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleCopyUrl(qrCode)}
                            className="flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                            style={{
                                borderColor: COFFEE_PALETTE.primary,
                                color: COFFEE_PALETTE.primary,
                                backgroundColor: 'transparent'
                            }}
                        >
                            <Copy size={14} />
                            Copy URL
                        </button>
                        <button
                            onClick={handleDownloadQR}
                            className="flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                            style={{
                                borderColor: COFFEE_PALETTE.primary,
                                color: COFFEE_PALETTE.primary,
                                backgroundColor: 'transparent'
                            }}
                        >
                            <Download size={14} />
                            Download QR
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
