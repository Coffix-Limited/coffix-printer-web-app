import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { Printer } from "../interface/Printer";
import { DEFAULT_TEMPLATE_NAME } from "@/app/constants/constant";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

async function generateUniqueCode(): Promise<string> {
  const snapshot = await getDocs(collection(db, "printer"));
  const existing = new Set(
    snapshot.docs.map((d) => d.data().uniqueCode).filter(Boolean),
  );

  let code: string;
  do {
    code = Array.from({ length: 8 }, () =>
      CHARSET[Math.floor(Math.random() * CHARSET.length)],
    ).join("");
  } while (existing.has(code));

  return code;
}

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
    location,
  }: {
    printerId: string;
    location: string;
  }): Promise<void> {
    try {
      const q = query(
        collection(db, "printer"),
        where("id", "==", printerId.trim()),
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Printer "${printerId.trim()}" already exists`);
      }
      const uniqueCode = await generateUniqueCode();
      const newPrinter = {
        id: printerId.trim().toUpperCase(),
        location,
        isOnline: false,
        templateName: DEFAULT_TEMPLATE_NAME,
        isVisible: true,
        uniqueCode,
        createdAt: serverTimestamp(),
      };

      const docRef = doc(collection(db, "printer"), newPrinter.id);
      await setDoc(
        docRef,
        {
          id: newPrinter.id,
          location: newPrinter.location,
          isOnline: newPrinter.isOnline,
          templateName: newPrinter.templateName,
          isVisible: newPrinter.isVisible,
          uniqueCode: newPrinter.uniqueCode,
          createdAt: newPrinter.createdAt,
        },
        { merge: true },
      );
      console.log("✅ Printer added:", newPrinter.id);
    } catch (error) {
      console.error("❌ Failed to add printer:", error);
      throw error;
    }
  },

  async updatePrinter(printer: Printer): Promise<void> {
    try {
      const printerRef = doc(db, "printer", printer.id);
      await updateDoc(printerRef, {
        location: printer.location,
        templateName: printer.templateName,
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
