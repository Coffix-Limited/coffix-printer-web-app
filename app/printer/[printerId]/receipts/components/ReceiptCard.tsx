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
        label: string;
        status: PrintQueueStatus;
        lines: string[];
        printTime: Date;
    };
    onStartEdit: (queue: PrintQueue) => void;
    onUpdate: (id: string) => void;
    onUpdateLabel: (label: string) => void;
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
    onUpdateLabel,
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
                borderColor: COFFEE_PALETTE.background
            }}
        >
            {isEditing ? (
                <div className="space-y-4 flex-1">
                    <h3 className="font-bold text-lg mb-4" style={{ color: COFFEE_PALETTE.background }}>
                        Edit Receipt
                    </h3>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                            Label
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => onUpdateLabel(e.target.value)}
                            placeholder="e.g. ORDER #55"
                            className="w-full px-3 py-2 rounded-md border text-sm mb-4"
                            style={{
                                backgroundColor: COFFEE_PALETTE.cardBg,
                                borderColor: COFFEE_PALETTE.background,
                                color: COFFEE_PALETTE.background
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => onUpdateStatus(e.target.value as PrintQueueStatus)}
                            className="w-full px-3 py-2 rounded-md border text-sm"
                            style={{
                                backgroundColor: COFFEE_PALETTE.cardBg,
                                borderColor: COFFEE_PALETTE.background,
                                color: COFFEE_PALETTE.background
                            }}
                        >
                            {Object.values(PrintQueueStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
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
                                            color: COFFEE_PALETTE.cardBg,
                                            borderWidth: 1,
                                            borderColor: isSelected ? COFFEE_PALETTE.primary : COFFEE_PALETTE.background
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs mt-1 opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                            Print at: {formData.printTime.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase mb-1 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
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
                                            borderColor: COFFEE_PALETTE.background,
                                            color: COFFEE_PALETTE.background
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-4">
                        <button
                            onClick={() => onUpdate(queue.id)}
                            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: COFFEE_PALETTE.primary,
                                color: COFFEE_PALETTE.cardBg
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
                                color: COFFEE_PALETTE.cardBg
                            }}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 min-w-0">
                                <span
                                    className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{
                                        backgroundColor: getStatusColor(queue.status) + '20',
                                        color: getStatusColor(queue.status)
                                    }}
                                >
                                    {queue.status}
                                </span>
                                <span className="text-xs font-semibold truncate min-w-0 max-w-[100px] sm:max-w-[140px]" style={{ color: COFFEE_PALETTE.primary }} title={`Job #${queue.jobId}`}>
                                    Job #{queue.jobId}
                                </span>
                                {queue.label ? (
                                    <span className="text-xs truncate shrink min-w-0 max-w-[80px] sm:max-w-[120px]" style={{ color: COFFEE_PALETTE.background }} title={queue.label}>
                                        {queue.label}
                                    </span>
                                ) : null}
                                <span className="text-xs font-mono shrink-0 opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                                    {queue.printerId}
                                </span>
                            </div>
                            {queue.printTime && (
                                <p className="text-xs opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                                    Print at: {new Date(queue.printTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
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
                                style={{ backgroundColor: COFFEE_PALETTE.background }}
                            >
                                <Trash2 className="w-4 h-4" style={{ color: COFFEE_PALETTE.primary }} />
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex-1" style={{ borderColor: COFFEE_PALETTE.background }}>
                        <label className="text-xs font-semibold uppercase mb-2 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                            Receipt Lines
                        </label>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {queue.lines.length > 0 ? (
                                queue.lines.map((line, index) => (
                                    <p key={index} className="text-sm font-mono whitespace-pre-line" style={{ color: COFFEE_PALETTE.background }}>
                                        {typeof line === "string" ? line.replace(/\\n/g, "\n") : line}
                                    </p>
                                ))
                            ) : (
                                <p className="text-sm italic opacity-70" style={{ color: COFFEE_PALETTE.background }}>
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
