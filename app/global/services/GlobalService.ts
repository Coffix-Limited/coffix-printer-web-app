import {
  collection,
  onSnapshot,
  query,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { Global } from "../interface";

export const GlobalService = {
  subscribeToGlobal(
    callback: (global: Global | null) => void,
    errorCallback?: (error: Error) => void,
  ): () => void {
    try {
      const collectionRef = collection(db, "global");
      const q = query(collectionRef, limit(1));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            callback(null);
          } else {
            const docSnap = snapshot.docs[0];
            const data = docSnap.data();
            callback({
              id: docSnap.id,
              daily_logs: data.daily_logs ?? 0,
              log_retention_days: data.log_retention_days ?? 7,
            });
          }
        },
        (error) => {
          console.error("❌ Firestore global subscription error:", error);
          if (errorCallback) errorCallback(error as Error);
        },
      );

      return unsubscribe;
    } catch (error) {
      console.error("❌ Failed to subscribe to global:", error);
      if (errorCallback) errorCallback(error as Error);
      return () => {};
    }
  },

  async updateGlobal(id: string, fields: Partial<Omit<Global, "id">>): Promise<void> {
    const docRef = doc(db, "global", id);
    await updateDoc(docRef, fields);
  },
};
