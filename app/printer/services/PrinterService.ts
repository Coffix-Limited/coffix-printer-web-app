import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { Printer } from "../interface/Printer";

export const PrinterService = {
  subscribeToPrinters(
    callback: (printer: Printer[]) => void,
    errorCallback?: (error: Error) => void,
  ): () => void {
    try {
      const collectionRef = collection(db, "printer");

      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            console.log("📭 No printers found in Firestore");
            callback([]);
          } else {
            const printer = snapshot.docs.map((d) => {
              const data = d.data();
              const createdAt = data.createdAt?.toDate?.() ?? new Date();
              return {
                id: d.id,
                ...data,
                createdAt,
              };
            });
            console.log("✅ Printers loaded:", printer.length);
            callback(printer as Printer[]);
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
      console.error("❌ Failed to subscribe to printers:", error);
      if (errorCallback) {
        errorCallback(error as Error);
      }
      return () => {};
    }
  },

  async addPrinter({
    printerId,
    label,
    location,
  }: {
    printerId: string;
    label: string;
    location: string;
  }): Promise<void> {
    try {
      const docRef = doc(collection(db, "printer"));
      await setDoc(
        docRef,
        {
          id: docRef.id,
          printerId: printerId.trim(),
          label,
          location,
          isOnline: false,
          lineDecorationId: "",
          isVisible: true,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      console.log("✅ Printer added:", printerId, label);
    } catch (error) {
      console.error("❌ Failed to add printer:", error);
      throw error;
    }
  },

  async updatePrinter(printer: Printer): Promise<void> {
    try {
      const printerRef = doc(db, "printer", printer.id);
      await updateDoc(printerRef, {
        printerId: printer.printerId ?? "",
        label: printer.label,
        location: printer.location,
        isOnline: printer.isOnline,
        lineDecorationId: printer.lineDecorationId || "",
        isVisible: printer.isVisible ?? true,
      });
      console.log("✅ Printer updated:", printer.id);
    } catch (error) {
      console.error("❌ Failed to update printer:", error);
      throw error;
    }
  },

  async deletePrinter(printerId: string): Promise<void> {
    try {
      const printerRef = doc(db, "printer", printerId);
      await deleteDoc(printerRef);
      console.log("✅ Printer deleted:", printerId);
    } catch (error) {
      console.error("❌ Failed to delete printer:", error);
      throw error;
    }
  },
};
