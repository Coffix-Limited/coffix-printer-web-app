"use client"

import { PrintQueue, PrintQueueStatus } from "../../../interface/PrintQueue";
import { COFFEE_PALETTE } from "@/app/constants/theme";
import { Edit, Trash2, Save, X } from "lucide-react";

const PRINT_TIME_OPTIONS = [
    { label: "Now", minutes: 0 },
    { label: "1 minute", minutes: 1 },
    { label: "5 minutes", minutes: 5 },
    { label: "30 minutes", minutes: 30 },
    { label: "1 hr", minutes: 60 },
] as const;

interface ReceiptCardProps {
    queue: PrintQueue;
    editingId: string | null;
    formData: {
        status: PrintQueueStatus;
        lines: string[];
        printTime: Date;
    };
    onStartEdit: (queue: PrintQueue) => void;
    onUpdate: (id: string) => void;
    onDelete: (id: string) => void;
    onCancelEdit: () => void;
    onUpdateLine: (index: number, value: string) => void;
    onAddLine: () => void;
    onRemoveLine: (index: number) => void;
    onUpdateStatus: (status: PrintQueueStatus) => void;
    setPrintTimeFromOption: (minutes: number) => void;
    selectedPrintTimeOption: number;
    getStatusColor: (status: PrintQueueStatus) => string;
}

export default function ReceiptCard({
    queue,
    editingId,
    formData,
    onStartEdit,
    onUpdate,
    onDelete,
    onCancelEdit,
    onUpdateLine,
    onAddLine,
    onRemoveLine,
    onUpdateStatus,
    setPrintTimeFromOption,
    selectedPrintTimeOption,
    getStatusColor
}: ReceiptCardProps) {
    const isEditing = editingId === queue.id;

    return (
        <div
            className="rounded-lg border shadow-sm p-6 h-full flex flex-col"
            style={{
                backgroundColor: COFFEE_PALETTE.cardBg,
                borderColor: COFFEE_PALETTE.border
            }}
        >
            {isEditing ? (
                <div className="space-y-4 flex-1">
                    <h3 className="font-bold text-lg mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>
                        Edit Receipt
                    </h3>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => onUpdateStatus(e.target.value as PrintQueueStatus)}
                            className="w-full px-3 py-2 rounded-md border text-sm"
                            style={{
                                backgroundColor: COFFEE_PALETTE.cardBg,
                                borderColor: COFFEE_PALETTE.border,
                                color: COFFEE_PALETTE.textPrimary
                            }}
                        >
                            {Object.values(PrintQueueStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Print time
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PRINT_TIME_OPTIONS.map(({ label, minutes }) => {
                                const isSelected = selectedPrintTimeOption === minutes;
                                return (
                                    <button
                                        key={minutes}
                                        type="button"
                                        onClick={() => setPrintTimeFromOption(minutes)}
                                        className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                                        style={{
                                            backgroundColor: isSelected ? COFFEE_PALETTE.primary : COFFEE_PALETTE.background,
                                            color: isSelected ? '#FFFFFF' : COFFEE_PALETTE.textPrimary,
                                            borderWidth: 1,
                                            borderColor: isSelected ? COFFEE_PALETTE.primary : COFFEE_PALETTE.border
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs mt-1" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Print at: {formData.printTime.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Lines
                        </label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {formData.lines.map((line, index) => (
                                <div key={index} className="flex gap-2">
                                    <textarea
                                        value={line}
                                        onChange={(e) => onUpdateLine(index, e.target.value)}
                                        placeholder={`Line ${index + 1} — one product per line`}
                                        rows={3}
                                        className="flex-1 px-3 py-2 rounded-md border text-sm resize-y min-h-16"
                                        style={{
                                            backgroundColor: COFFEE_PALETTE.cardBg,
                                            borderColor: COFFEE_PALETTE.border,
                                            color: COFFEE_PALETTE.textPrimary
                                        }}
                                    />
                                    {formData.lines.length > 1 && (
                                        <button
                                            onClick={() => onRemoveLine(index)}
                                            className="px-2 py-2 rounded-md transition-opacity hover:opacity-80 shrink-0"
                                            style={{ backgroundColor: COFFEE_PALETTE.error, color: '#FFFFFF' }}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={onAddLine}
                            className="mt-2 px-3 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: COFFEE_PALETTE.background,
                                color: COFFEE_PALETTE.primary
                            }}
                        >
                            + Add Line
                        </button>
                    </div>
                    <div className="flex gap-2 mt-auto pt-4">
                        <button
                            onClick={() => onUpdate(queue.id)}
                            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: COFFEE_PALETTE.success,
                                color: '#FFFFFF'
                            }}
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: COFFEE_PALETTE.background,
                                color: COFFEE_PALETTE.textPrimary
                            }}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{
                                        backgroundColor: getStatusColor(queue.status) + '20',
                                        color: getStatusColor(queue.status)
                                    }}
                                >
                                    {queue.status}
                                </span>
                                <span className="text-xs font-mono" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    {queue.id.slice(0, 8)}
                                </span>
                            </div>
                            <p className="text-xs" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                Created: {queue.createdAt.toLocaleString()}
                            </p>
                            {queue.printTime && (
                                <p className="text-xs" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    Print at: {new Date(queue.printTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onStartEdit(queue)}
                                className="p-2 rounded-md transition-opacity hover:opacity-80"
                                style={{ backgroundColor: COFFEE_PALETTE.background }}
                            >
                                <Edit className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />
                            </button>
                            <button
                                onClick={() => onDelete(queue.id)}
                                className="p-2 rounded-md transition-opacity hover:opacity-80"
                                style={{ backgroundColor: COFFEE_PALETTE.error + '20' }}
                            >
                                <Trash2 className="w-4 h-4" style={{ color: COFFEE_PALETTE.error }} />
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex-1" style={{ borderColor: COFFEE_PALETTE.border }}>
                        <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                            Receipt Lines
                        </label>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {queue.lines.length > 0 ? (
                                queue.lines.map((line, index) => (
                                    <p key={index} className="text-sm font-mono whitespace-pre-line" style={{ color: COFFEE_PALETTE.textPrimary }}>
                                        {typeof line === "string" ? line.replace(/\\n/g, "\n") : line}
                                    </p>
                                ))
                            ) : (
                                <p className="text-sm italic" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                    No lines
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
