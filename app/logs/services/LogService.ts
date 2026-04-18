import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { Log } from "../interface/Log";

export const LogService = {
  subscribeToLogs(
    callback: (logs: Log[]) => void,
    errorCallback?: (error: Error) => void,
  ): () => void {
    try {
      const collectionRef = collection(db, "logs");
      const q = query(collectionRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            console.log("📭 No logs found in Firestore");
            callback([]);
          } else {
            const logs = snapshot.docs.map((doc) => {
              const data = doc.data();

              return {
                id: doc.id,
                level: data.level || "info",
                message: data.message || "",
                timestamp: data.timestamp?.toDate() || new Date(),
                printerId: data.printerId || "",
                serverId: data.serverId || "",
                version: data.version || "",
                jobId: data.jobId || "",
                label: data.label || "",
              };
            });
            console.log("✅ Logs loaded:", logs.length);
            callback(logs as Log[]);
          }
        },
        (error) => {
          console.error("❌ Firestore logs subscription error:", error);
          if (error.code === "permission-denied") {
            console.error(
              "🔒 Check Firestore Security Rules - see FIREBASE_SETUP.md",
            );
          }
          if (errorCallback) {
            errorCallback(error as Error);
          }
        },
      );
      return unsubscribe;
    } catch (error) {
      console.error("❌ Failed to subscribe to logs:", error);
      if (errorCallback) {
        errorCallback(error as Error);
      }
      return () => {};
    }
  },

  async createLog(log: Omit<Log, "id">): Promise<void> {
    const collectionRef = collection(db, "logs");
    await addDoc(collectionRef, {
      ...log,
      timestamp: Timestamp.fromDate(log.timestamp),
    });
  },
};
