import { create } from "zustand";
import { Unsubscribe } from "firebase/firestore";
import { PrinterService } from "../services/PrinterService";
import { Printer } from "../interface/Printer";

interface PrinterStore {
    printers: Printer[];
    unsubscribe: Unsubscribe | null;
    loading: boolean;
    error: string | null;
    setPrinters: () => void;
    deletePrinter: (printerId: string) => Promise<void>;
    setPrinterVisible: (printerId: string, isVisible: boolean) => Promise<void>;
}

export const usePrinterStore = create<PrinterStore>((set, get) => ({
    printers: [],
    unsubscribe: null,
    loading: false,
    error: null,
    setPrinters: () => {
        const {unsubscribe} = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null })
        }

        set({ loading: true, error: null });

        const unsubscribeListener = PrinterService.subscribeToPrinters(
            (printers) => {
                console.log("Printers fetched...", printers.length)
                set({ printers, loading: false, error: null })
            },
            (error) => {
                console.error("Printer subscription error:", error);
                set({ 
                    error: error.message || 'Failed to load printers', 
                    loading: false,
                    printers: []
                })
            }
        );

        set({unsubscribe: unsubscribeListener});
    },
    deletePrinter: async (printerId: string) => {
        await PrinterService.deletePrinter(printerId);
    },
    setPrinterVisible: async (printerId: string, isVisible: boolean) => {
        const printer = get().printers.find((p) => p.id === printerId);
        if (!printer) return;
        await PrinterService.updatePrinter({ ...printer, isVisible });
    },
}))