import { create } from "zustand";
import { PrinterService } from "../services/PrinterService";
import { ServerService } from "../../server/services/ServerService";
import { Printer } from "../interface/Printer";
import { PosServer } from "../../server/interface/Server";

type Unsubscribe = () => void;

function mergePrintersWithServers(
  rawPrinters: Printer[],
  servers: PosServer[],
): Printer[] {
  return rawPrinters.map((p) => {
    const connected: PosServer[] = servers
      .filter(
        (server) =>
         server.printerId === p.id
      )
      .sort((a, b) => {
        const toMs = (d: Date | { toDate?: () => Date } | undefined) => {
          if (!d) return 0;
          const date =
            d instanceof Date ? d : (d as { toDate?(): Date }).toDate?.();
          return date ? date.getTime() : 0;
        };
        const at = toMs(a.connectedAt);
        const bt = toMs(b.connectedAt);
        return bt - at;
      });
    const latest: PosServer = connected[0];
    return {
      ...p,
      isOnline: latest?.printerConnected ?? false,
      connectedServerId: latest?.id,
    };
  });
}

interface PrinterStore {
  printers: Printer[];
  unsubscribe: Unsubscribe | null;
  selectedPrinter: Printer | null;
  loading: boolean;
  error: string | null;
  setPrinters: () => void;
  setPrinter: (printer: Printer) => void;
  deletePrinter: (printerId: string) => Promise<void>;
  setPrinterVisible: (printerId: string, isVisible: boolean) => Promise<void>;
}

export const usePrinterStore = create<PrinterStore>((set, get) => ({
  printers: [],
  unsubscribe: null,
  selectedPrinter: null,
  loading: false,
  error: null,
  setPrinters: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true, error: null });

    let rawPrinters: Printer[] = [];
    let servers: PosServer[] = [];

    const unsubServer = ServerService.subscribeToServers(
      (serverList) => {
        servers = serverList;
        set({
          printers: mergePrintersWithServers(rawPrinters, servers),
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error("Server subscription error:", error);
        set({
          error: error.message || "Failed to load servers",
          loading: false,
          printers: [],
        });
      },
    );

    const unsubPrinter = PrinterService.subscribeToPrinters(
      (printerList) => {
        rawPrinters = printerList;
        set({
          printers: mergePrintersWithServers(printerList, servers),
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error("Printer subscription error:", error);
        set({
          error: error.message || "Failed to load printers",
          loading: false,
          printers: [],
        });
      },
    );

    const unsubscribeListener = () => {
      unsubServer();
      unsubPrinter();
    };
    set({ unsubscribe: unsubscribeListener });
  },
  setPrinter: (printer: Printer) => {
    set({ selectedPrinter: printer });
  },
  deletePrinter: async (printerId: string) => {
    await PrinterService.deletePrinter(printerId);
  },
  setPrinterVisible: async (printerId: string, isVisible: boolean) => {
    const printer = get().printers.find((p) => p.id === printerId);
    if (!printer) return;
    await PrinterService.updatePrinter({ ...printer, isVisible });
  },
}));
