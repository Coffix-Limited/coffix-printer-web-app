import { create } from "zustand";
import { Unsubscribe } from "firebase/firestore";
import { LogService } from "../services/LogService";
import { Log } from "../interface/Log";

interface LogStore {
  logs: Log[];
  unsubscribe: Unsubscribe | null;
  loading: boolean;
  error: string | null;
  filterLevel: string | null;
  searchQuery: string;
  setLogs: () => void;
  setFilterLevel: (level: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  unsubscribe: null,
  loading: false,
  error: null,
  filterLevel: null,
  searchQuery: "",

  setLogs: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }

    set({ loading: true, error: null });

    const unsubscribeListener = LogService.subscribeToLogs(
      (logs) => {
        console.log("Logs fetched...", logs.length);
        set({ logs, loading: false, error: null });
      },
      (error) => {
        console.error("Log subscription error:", error);
        set({
          error: error.message || "Failed to load logs",
          loading: false,
          logs: [],
        });
      },
    );

    set({ unsubscribe: unsubscribeListener });
  },

  setFilterLevel: (level) => set({ filterLevel: level }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
