import { Unsubscribe } from "firebase/firestore";
import { PrintQueue } from "../interface/PrintQueue";
import { create } from "zustand";
import { PrintQueueService } from "../services/PrintQueueService";

interface PrintQueueStore {
    printQueue: PrintQueue[];
    unsubscribe: Unsubscribe | null;
    loading: boolean;
    error: string | null;
    setPrintQueue: (printerId: string) => void;
    createPrintQueue: (printQueue: Omit<PrintQueue, 'id'>) => Promise<void>;
    updatePrintQueue: (printQueue: PrintQueue) => Promise<void>;
    deletePrintQueue: (id: string) => Promise<void>;
}

export const usePrintQueueStore = create<PrintQueueStore>((set, get) => ({
    printQueue: [],
    unsubscribe: null,
    loading: false,
    error: null,
    setPrintQueue: (printerId: string) => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null })
        }

        set({ loading: true, error: null });

        const unsubscribeListener = PrintQueueService.subscribeToPrintQueues(
            printerId,
            (printQueue) => {
                console.log("Print queues fetched...", printQueue.length)
                set({ printQueue, loading: false, error: null })
            },
            (error) => {
                console.error("Print queue subscription error:", error);
                set({ 
                    error: error.message || 'Failed to load print queues', 
                    loading: false,
                    printQueue: []
                })
            }
        );

        set({ unsubscribe: unsubscribeListener });
    },
    createPrintQueue: async (printQueue: Omit<PrintQueue, 'id'>) => {
        try {
            await PrintQueueService.createPrintQueue(printQueue);
        } catch (error) {
            console.error("Failed to create print queue:", error);
            throw error;
        }
    },
    updatePrintQueue: async (printQueue: PrintQueue) => {
        try {
            await PrintQueueService.updatePrintQueue(printQueue);
        } catch (error) {
            console.error("Failed to update print queue:", error);
            throw error;
        }
    },
    deletePrintQueue: async (id: string) => {
        try {
            await PrintQueueService.deletePrintQueue(id);
        } catch (error) {
            console.error("Failed to delete print queue:", error);
            throw error;
        }
    },
}))