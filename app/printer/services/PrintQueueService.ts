import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  setDoc,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { PrintQueue, PrintQueueStatus } from "../interface/PrintQueue";
import { db } from "@/app/utils/firebase.browser";

const COUNTER_DOC = "printQueueJob";
const COUNTER_COLLECTION = "counters";

const trimTrailingEmptyLines = (lines: string[]): string[] => {
  const result = [...lines];
  while (result.length > 0) {
    const last = result[result.length - 1];
    if (typeof last === "string" && last.trim() === "") {
      result.pop();
    } else {
      break;
    }
  }
  return result;
};

export const PrintQueueService = {
  subscribeToPrintQueues(
    printerId: string,
    callback: (printQueue: PrintQueue[]) => void,
    errorCallback?: (error: Error) => void,
  ): () => void {
    try {
      const collectionRef = query(
        collection(db, "printQueue"),
        where("printerId", "==", printerId),
        orderBy("printTime", "desc"),
      );
      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot) => {
          if (snapshot.empty) {
            console.log("📭 No print queues found in Firestore");
            callback([]);
          } else {
            const printQueue = snapshot.docs.map((d) => {
              const data = d.data();
              const jobId = data.jobId != null ? String(data.jobId) : d.id;
              return {
                id: d.id,
                jobId,
                label: data.label ?? "",
                printerId: data.printerId,
                status: data.status || PrintQueueStatus.PENDING,
                lines: data.lines || [],
                templateName: data.templateName || "",
                printTime: data.printTime?.toDate() || new Date(),
              };
            });
            console.log("✅ Print Queues loaded:", printQueue.length);
            callback(printQueue as PrintQueue[]);
          }
        },
        (error) => {
          console.error("❌ Firestore subscription error:", error);
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
      console.error("❌ Failed to subscribe to print queues:", error);
      if (errorCallback) {
        errorCallback(error as Error);
      }
      return () => {};
    }
  },

  async createPrintQueue(
    printQueue: Omit<PrintQueue, "id" | "jobId">,
  ): Promise<string> {
    try {
      const cleanedLines = trimTrailingEmptyLines(printQueue.lines);
      const counterRef = doc(db, COUNTER_COLLECTION, COUNTER_DOC);
      const nextJobNum = await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        const next = (snap.exists() ? (snap.data()?.next ?? 0) : 0) + 1;
        tx.set(counterRef, { next }, { merge: true });
        return next;
      });
      const jobId = String(nextJobNum);
      const docRef = doc(db, "printQueue", jobId);
      await setDoc(docRef, {
        jobId,
        label: printQueue.label ?? "",
        printerId: printQueue.printerId,
        status: printQueue.status,
        lines: cleanedLines,
        printTime: Timestamp.fromDate(printQueue.printTime),
        templateName: printQueue.templateName ?? "",
      });
      console.log("✅ Print queue created: Job #" + jobId);
      return jobId;
    } catch (error) {
      console.error("❌ Failed to create print queue:", error);
      throw error;
    }
  },

  async updatePrintQueue(printQueue: PrintQueue): Promise<void> {
    try {
      const cleanedLines = trimTrailingEmptyLines(printQueue.lines);
      const printQueueRef = doc(db, "printQueue", printQueue.id);
      await updateDoc(printQueueRef, {
        label: printQueue.label ?? "",
        printerId: printQueue.printerId,
        status: printQueue.status,
        lines: cleanedLines,
        printTime: Timestamp.fromDate(printQueue.printTime),
        templateName: printQueue.templateName ?? "",
      });
      console.log("✅ Print queue updated: Job #" + printQueue.jobId);
    } catch (error) {
      console.error("❌ Failed to update print queue:", error);
      throw error;
    }
  },

  async deletePrintQueue(id: string): Promise<void> {
    try {
      const printQueueRef = doc(db, "printQueue", id);
      await deleteDoc(printQueueRef);
      console.log("✅ Print queue deleted:", id);
    } catch (error) {
      console.error("❌ Failed to delete print queue:", error);
      throw error;
    }
  },
};
