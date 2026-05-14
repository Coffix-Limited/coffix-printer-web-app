import { create } from "zustand";
import { Unsubscribe } from "firebase/firestore";
import { GlobalService } from "../services/GlobalService";
import { Global } from "../interface";
import { LogService } from "@/app/logs/services/LogService";

interface GlobalStore {
  global: Global | null;
  unsubscribe: Unsubscribe | null;
  loading: boolean;
  error: string | null;
  subscribe: () => void;
  cleanup: () => void;
  update: (fields: Partial<Omit<Global, "id">>) => Promise<void>;
}

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  global: null,
  unsubscribe: null,
  loading: false,
  error: null,

  subscribe: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true, error: null });

    const unsub = GlobalService.subscribeToGlobal(
      (global) => set({ global, loading: false, error: null }),
      (error) =>
        set({
          error: error.message || "Failed to load settings",
          loading: false,
        }),
    );

    set({ unsubscribe: unsub });
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  update: async (fields) => {
    const { global } = get();
    if (!global?.id) throw new Error("Global config not loaded");
    await GlobalService.updateGlobal(global.id, fields);
    LogService.createLog({
      level: "info",
      message: `Updated global settings`,
      printerId: "",
      serverId: "",
      version: "",
      jobId: "",
      label: "",
    });
  },
}));
