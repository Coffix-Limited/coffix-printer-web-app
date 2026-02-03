"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrintQueueStore } from "../../store/usePrintQueueStore";
import { PrintQueue, PrintQueueStatus } from "../../interface/PrintQueue";
import { COFFEE_PALETTE } from "@/app/constants/theme";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import ReceiptCard from "./components/ReceiptCard";

const SAMPLE_LINES = [
    "COFFEE SHOP",
    "123 Main Street",
    "Order #12345",
    "Date: 28 Jan 2026",
    "Cashier: John",
    "2x Flat White - $8.00",
    "1x Long Black - $4.50",
    "1x Cappuccino - $5.00",
    "Subtotal: $17.50",
    "Tax (15%): $2.63",
    "Total: $20.13",
    "Thank you!",
    "Visit us again",
    "www.coffeeshop.com",
    "Scan QR for feedback"
];

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

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<PrintQueueStatus | 'ALL'>('ALL');
    const [formData, setFormData] = useState({
        status: PrintQueueStatus.PENDING,
        lines: [...SAMPLE_LINES] as string[],
        serviceTime: new Date(),
    });

    useEffect(() => {
        if (printerId) {
            setPrintQueue(printerId);
        }
    }, [printerId, setPrintQueue]);

    const filteredQueue = statusFilter === 'ALL'
        ? printQueue
        : printQueue.filter(q => q.status === statusFilter);

    const displayQueue = filteredQueue.slice(0, 15);

    const handleCreate = async () => {
        try {
            await createPrintQueue({
                printerId,
                createdAt: new Date(),
                status: formData.status,
                lines: formData.lines.filter(line => line.trim() !== ''),
                serviceTime: formData.serviceTime,
            });
            setIsCreating(false);
            setFormData({
                status: PrintQueueStatus.PENDING,
                lines: [...SAMPLE_LINES],
                serviceTime: new Date(),
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
                status: formData.status,
                lines: formData.lines.filter(line => line.trim() !== ''),
                serviceTime: formData.serviceTime,
            });
            setEditingId(null);
            setFormData({
                status: PrintQueueStatus.PENDING,
                lines: [...SAMPLE_LINES],
                serviceTime: new Date(),
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
        setFormData({
            status: queue.status,
            lines: queue.lines.length > 0 ? queue.lines : [''],
            serviceTime: queue.serviceTime,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({
            status: PrintQueueStatus.PENDING,
            lines: [...SAMPLE_LINES],
            serviceTime: new Date(),
        });
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
        switch (status) {
            case PrintQueueStatus.COMPLETED:
                return COFFEE_PALETTE.success;
            case PrintQueueStatus.ERROR:
                return COFFEE_PALETTE.error;
            case PrintQueueStatus.PROCESSING:
                return COFFEE_PALETTE.warning;
            default:
                return COFFEE_PALETTE.textSecondary;
        }
    };

    return (
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.push(`/printer/${printerId}`)}
                    className="p-2 rounded-md transition-opacity hover:opacity-80"
                    style={{ backgroundColor: COFFEE_PALETTE.background }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: COFFEE_PALETTE.primary }} />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
                        Print Queue Receipts
                    </h2>
                    <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
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
                            borderColor: COFFEE_PALETTE.border,
                            color: COFFEE_PALETTE.textPrimary
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
                            setFormData({
                                status: PrintQueueStatus.PENDING,
                                lines: [...SAMPLE_LINES],
                                serviceTime: new Date(),
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
                    <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>Loading print queue...</p>
                </div>
            )}

            {isCreating && (
                <div className="mb-6 rounded-lg border shadow-sm p-6" style={{
                    backgroundColor: COFFEE_PALETTE.cardBg,
                    borderColor: COFFEE_PALETTE.border
                }}>
                    <h3 className="font-bold text-lg mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>
                        Create New Receipt
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PrintQueueStatus }))}
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
                                Lines
                            </label>
                            {formData.lines.map((line, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={line}
                                        onChange={(e) => updateLine(index, e.target.value)}
                                        placeholder={`Line ${index + 1}`}
                                        className="flex-1 px-3 py-2 rounded-md border text-sm"
                                        style={{
                                            backgroundColor: COFFEE_PALETTE.cardBg,
                                            borderColor: COFFEE_PALETTE.border,
                                            color: COFFEE_PALETTE.textPrimary
                                        }}
                                    />
                                    {formData.lines.length > 1 && (
                                        <button
                                            onClick={() => removeLine(index)}
                                            className="px-2 py-2 rounded-md transition-opacity hover:opacity-80"
                                            style={{ backgroundColor: COFFEE_PALETTE.error, color: '#FFFFFF' }}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addLine}
                                className="mt-2 px-3 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-90"
                                style={{
                                    backgroundColor: COFFEE_PALETTE.background,
                                    color: COFFEE_PALETTE.primary
                                }}
                            >
                                + Add Line
                            </button>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase mb-1 block" style={{ color: COFFEE_PALETTE.textSecondary }}>
                                Service Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.serviceTime.toISOString().slice(0, 16)}
                                onChange={(e) => setFormData(prev => ({ ...prev, serviceTime: new Date(e.target.value) }))}
                                className="w-full px-3 py-2 rounded-md border text-sm"
                                style={{
                                    backgroundColor: COFFEE_PALETTE.cardBg,
                                    borderColor: COFFEE_PALETTE.border,
                                    color: COFFEE_PALETTE.textPrimary
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2"
                                style={{
                                    backgroundColor: COFFEE_PALETTE.success,
                                    color: '#FFFFFF'
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
                                    color: COFFEE_PALETTE.textPrimary
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
                        borderColor: COFFEE_PALETTE.border
                    }}>
                        <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
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
                            onUpdateServiceTime={(date) => setFormData(prev => ({ ...prev, serviceTime: date }))}
                            getStatusColor={getStatusColor}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
