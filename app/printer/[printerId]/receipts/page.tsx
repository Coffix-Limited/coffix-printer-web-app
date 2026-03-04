"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrintQueueStore } from "../../store/usePrintQueueStore";
import { PrintQueue, PrintQueueStatus } from "../../interface/PrintQueue";
import { COFFEE_PALETTE } from "@/app/constants/theme";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import ReceiptCard from "./components/ReceiptCard";
import { SAMPLE_LINES } from "@/app/templates/constants";
import { usePrinterStore } from "../../store/usePrinterStore";
import type { Printer } from "../../interface/Printer";
import { useTemplateStore } from "@/app/templates/store/useTemplateStore";

const PRINT_TIME_OPTIONS = [
    { label: "Now", minutes: 0 },
    { label: "1 minute", minutes: 1 },
    { label: "5 minutes", minutes: 5 },
    { label: "30 minutes", minutes: 30 },
    { label: "1 hr", minutes: 60 },
] as const;


export default function ReceiptsPage() {
    const params = useParams();
    const router = useRouter();
    const printerId = params.printerId as string;

    const {
        printQueue,
        setPrintQueue,
        createPrintQueue,
        updatePrintQueue,
        deletePrintQueue,
        loading
    } = usePrintQueueStore();

    const { printers, setPrinters } = usePrinterStore();
    const { lineDecorations, setLineDecorations } = useTemplateStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<PrintQueueStatus | 'ALL'>('ALL');
    const [templateNameFilter, setTemplateNameFilter] = useState<string | 'DEFAULT'>('DEFAULT');
    const [selectedPrintTimeOption, setSelectedPrintTimeOption] = useState<number>(0);
    const [formData, setFormData] = useState({
        label: "",
        status: PrintQueueStatus.PENDING,
        lines: [...SAMPLE_LINES] as string[],
        printTime: new Date(),
    });

    useEffect(() => {
        setLineDecorations();
        setPrintQueue(printerId);
    }, [setLineDecorations, setPrintQueue, printerId]);


    const filteredQueue = statusFilter === 'ALL'
        ? printQueue
        : printQueue.filter(q => q.status === statusFilter);

    const displayQueue = filteredQueue.slice(0, 15);

    const handleCreate = async () => {
        try {
            await createPrintQueue({
                label: formData.label.trim(),
                printerId: printerId,
                status: formData.status,
                lines: formData.lines,
                printTime: formData.printTime,
                templateName: templateNameFilter,
            });
            setIsCreating(false);
            setFormData({
                label: "",
                status: PrintQueueStatus.PENDING,
                lines: [...SAMPLE_LINES],
                printTime: new Date(),
            });
        } catch (error) {
            console.error('Failed to create print queue:', error);
            alert('Failed to create print queue');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const queue = printQueue.find(q => q.id === id);
            if (!queue) return;

            await updatePrintQueue({
                ...queue,
                label: formData.label.trim(),
                status: formData.status,
                lines: formData.lines,
                printTime: formData.printTime,
            });
            setEditingId(null);
            setFormData({
                label: "",
                status: PrintQueueStatus.PENDING,
                lines: [...SAMPLE_LINES],
                printTime: new Date(),
            });
        } catch (error) {
            console.error('Failed to update print queue:', error);
            alert('Failed to update print queue');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this print queue item?')) return;
        try {
            await deletePrintQueue(id);
        } catch (error) {
            console.error('Failed to delete print queue:', error);
            alert('Failed to delete print queue');
        }
    };

    const startEdit = (queue: PrintQueue) => {
        setEditingId(queue.id);
        const printTime = queue.printTime ? new Date(queue.printTime) : new Date();
        const diffMinutes = (printTime.getTime() - Date.now()) / 60000;
        const option = PRINT_TIME_OPTIONS.find(o => Math.abs(o.minutes - diffMinutes) < 0.5);
        setSelectedPrintTimeOption(option?.minutes ?? 0);
        setFormData({
            label: queue.label ?? "",
            status: queue.status,
            lines: queue.lines.length > 0 ? queue.lines : [''],
            printTime,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setSelectedPrintTimeOption(0);
        setFormData({
            label: "",
            status: PrintQueueStatus.PENDING,
            lines: [...SAMPLE_LINES],
            printTime: new Date(),
        });
    };

    const setPrintTimeFromOption = (minutes: number) => {
        setSelectedPrintTimeOption(minutes);
        const base = new Date();
        base.setMinutes(base.getMinutes() + minutes);
        const status = minutes === 0 ? PrintQueueStatus.PENDING : PrintQueueStatus.SCHEDULED;
        setFormData(prev => ({ ...prev, printTime: base, status }));
    };

    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, '']
        }));
    };

    const updateLine = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            lines: prev.lines.map((line, i) => i === index ? value : line)
        }));
    };

    const removeLine = (index: number) => {
        setFormData(prev => ({
            ...prev,
            lines: prev.lines.filter((_, i) => i !== index)
        }));
    };

    const getStatusColor = (status: PrintQueueStatus) => {
        void status;
        return COFFEE_PALETTE.primary;
    };

    return (
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.push(`/printer/${printerId}`)}
                    className="p-2 rounded-md transition-opacity hover:opacity-80"
                    style={{ backgroundColor: COFFEE_PALETTE.cardBg }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: COFFEE_PALETTE.primary }} />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.cardBg }}>
                        Print Queue Receipts
                    </h2>
                    <p className="text-sm opacity-80" style={{ color: COFFEE_PALETTE.cardBg }}>
                        Manage print queue items • Showing {displayQueue.length} of {filteredQueue.length}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as PrintQueueStatus | 'ALL')}
                        className="px-3 py-2 rounded-md border text-sm"
                        style={{
                            backgroundColor: COFFEE_PALETTE.cardBg,
                            borderColor: COFFEE_PALETTE.background,
                            color: COFFEE_PALETTE.background
                        }}
                    >
                        <option value="ALL">All Statuses</option>
                        {Object.values(PrintQueueStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setSelectedPrintTimeOption(0);
                            setFormData({
                                label: "",
                                status: PrintQueueStatus.PENDING,
                                lines: [...SAMPLE_LINES],
                                printTime: new Date(),
                            });
                        }}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2"
                        style={{
                            backgroundColor: COFFEE_PALETTE.primary,
                            color: '#FFFFFF'
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Receipt
                    </button>
                </div>
            </div>

            {loading && (
                <div className="text-center py-12">
                    <p className="text-sm opacity-80" style={{ color: COFFEE_PALETTE.cardBg }}>Loading print queue...</p>
                </div>
            )}

            {isCreating && (
                <div className="mb-6 rounded-lg border shadow-sm p-6" style={{
                    backgroundColor: COFFEE_PALETTE.cardBg,
                    borderColor: COFFEE_PALETTE.primary
                }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: COFFEE_PALETTE.background }}>
                        Create New Receipt
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold uppercase mb-1 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                                Label
                            </label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="e.g. ORDER #55, INVOICE x10"
                                className="w-full px-3 py-2 rounded-md border text-sm"
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
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PrintQueueStatus }))}
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
                            <label className="text-xs font-semibold uppercase mb-1 mt-4 block opacity-70" style={{ color: COFFEE_PALETTE.background }}>
                                Template Name
                            </label>
                            <select
                                value={templateNameFilter}
                                onChange={(e) => setTemplateNameFilter(e.target.value as string | 'DEFAULT')}
                                className="px-3 py-2 rounded-md border text-sm"
                                style={{
                                    backgroundColor: COFFEE_PALETTE.cardBg,
                                    borderColor: COFFEE_PALETTE.background,
                                    color: COFFEE_PALETTE.background
                                }}
                            >
                                {lineDecorations.map(template => (
                                    <option key={template.id} value={template.templateName}>{template.templateName}</option>
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
                            {formData.lines.map((line, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <textarea
                                        value={line}
                                        onChange={(e) => updateLine(index, e.target.value)}
                                        placeholder={`Line ${index + 1} — type multiple products (one per line)`}
                                        rows={3}
                                        className="flex-1 px-3 py-2 rounded-md border text-sm resize-y min-h-16"
                                        style={{
                                            backgroundColor: COFFEE_PALETTE.cardBg,
                                            borderColor: COFFEE_PALETTE.background,
                                            color: COFFEE_PALETTE.background
                                        }}
                                    />
                                    {formData.lines.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLine(index)}
                                            className="px-2 py-2 rounded-md transition-opacity hover:opacity-80 shrink-0"
                                            style={{
                                                backgroundColor: COFFEE_PALETTE.primary,
                                                color: COFFEE_PALETTE.cardBg
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.lines.length < 15 &&
                                <button
                                    type="button"
                                    onClick={addLine}
                                    className="mt-2 px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
                                    style={{
                                        backgroundColor: COFFEE_PALETTE.background,
                                        color: COFFEE_PALETTE.cardBg
                                    }}
                                >
                                    + Add line
                                </button>}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2"
                                style={{
                                    backgroundColor: COFFEE_PALETTE.primary,
                                    color: COFFEE_PALETTE.cardBg
                                }}
                            >
                                <Save className="w-4 h-4" />
                                Create
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2"
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
                </div>
            )}

            <div className="space-y-4">
                {displayQueue.length === 0 && !loading && (
                    <div className="text-center py-12 rounded-lg border" style={{
                        backgroundColor: COFFEE_PALETTE.cardBg,
                        borderColor: COFFEE_PALETTE.primary
                    }}>
                        <p className="text-sm" style={{ color: COFFEE_PALETTE.background }}>
                            {statusFilter === 'ALL'
                                ? 'No print queue items found. Create one to get started.'
                                : `No ${statusFilter} items found.`
                            }
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayQueue.map((queue) => (
                        <ReceiptCard
                            key={queue.id}
                            queue={queue}
                            editingId={editingId}
                            formData={formData}
                            onStartEdit={startEdit}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onCancelEdit={cancelEdit}
                            onUpdateLine={updateLine}
                            onAddLine={addLine}
                            onRemoveLine={removeLine}
                            onUpdateStatus={(status) => setFormData(prev => ({ ...prev, status }))}
                            onUpdateLabel={(label) => setFormData(prev => ({ ...prev, label }))}
                            setPrintTimeFromOption={setPrintTimeFromOption}
                            selectedPrintTimeOption={selectedPrintTimeOption}
                            getStatusColor={getStatusColor}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
