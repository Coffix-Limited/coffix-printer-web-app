import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { PosServer } from "../interface/Server";

export const ServerService = {
  subscribeToServers(
    callback: (servers: PosServer[]) => void,
    errorCallback?: (error: Error) => void,
  ): () => void {
    try {
      const collectionRef = collection(db, "server");

      const q = query(collectionRef, orderBy("connectedAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log(snapshot.docs.length);
          if (snapshot.empty) {
            console.log("📭 No servers found in Firestore");
            callback([]);
          } else {
            const server = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
              } as PosServer;
            });

            console.log("✅ Servers loaded:", server.length);
            callback(server as PosServer[]);
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
      console.error("❌ Failed to subscribe to servers:", error);
      if (errorCallback) {
        errorCallback(error as Error);
      }
      return () => {};
    }
  },
};
