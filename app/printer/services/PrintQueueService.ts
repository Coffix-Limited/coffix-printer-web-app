import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { PrintQueue, PrintQueueStatus } from "../interface/PrintQueue";
import { db } from "@/app/utils/firebase.browser";

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
            const printQueue = snapshot.docs.map((doc) => {
              const data = doc.data();
              const printTimeRaw = data.printTime ?? data.serviceTime;
              const printTime = printTimeRaw?.toDate
                ? printTimeRaw.toDate()
                : printTimeRaw
                  ? new Date(printTimeRaw)
                  : new Date();
              return {
                id: doc.id,
                printerId: data.printerId,
                printerName: data.printerName ?? undefined,
                createdAt: data.createdAt?.toDate() || new Date(),
                status: data.status || PrintQueueStatus.PENDING,
                lines: data.lines || [],
                printTime,
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

  async createPrintQueue(printQueue: Omit<PrintQueue, "id">): Promise<string> {
    try {
      const docRef = doc(collection(db, "printQueue"));
      // const docId = docRef.id;
      await setDoc(docRef, {
        printerId: printQueue.printerId,
        ...(printQueue.printerName != null && { printerName: printQueue.printerName }),
        createdAt: Timestamp.fromDate(printQueue.createdAt),
        status: printQueue.status,
        lines: printQueue.lines,
        printTime: Timestamp.fromDate(printQueue.printTime),
      });
      console.log("✅ Print queue created:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Failed to create print queue:", error);
      throw error;
    }
  },

  async updatePrintQueue(printQueue: PrintQueue): Promise<void> {
    try {
      const printQueueRef = doc(db, "printQueue", printQueue.id);
      await updateDoc(printQueueRef, {
        printerId: printQueue.printerId,
        ...(printQueue.printerName != null && { printerName: printQueue.printerName }),
        createdAt: Timestamp.fromDate(printQueue.createdAt),
        status: printQueue.status,
        lines: printQueue.lines,
        printTime: Timestamp.fromDate(printQueue.printTime),
      });
      console.log("✅ Print queue updated:", printQueue.id);
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
