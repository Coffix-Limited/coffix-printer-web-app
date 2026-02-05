import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { Log } from "../interface/Log";

export const LogService = {

    subscribeToLogs(
        callback: (logs: Log[]) => void,
        errorCallback?: (error: Error) => void,
        maxLogs: number = 50
    ): (() => void) {
        try {
            const collectionRef = collection(db, "logs");
            const q = query(collectionRef, orderBy("timestamp", "desc"), limit(maxLogs));
            
            const unsubscribe = onSnapshot(
                q, 
                (snapshot) => {
                    if (snapshot.empty) {
                        console.log('📭 No logs found in Firestore');
                        callback([])
                    } else {
                        const logs = snapshot.docs.map(doc => {
                            const data = doc.data();
                            let timestamp: Date;
                            
                            if (data.timestamp) {
                                timestamp = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                            } else if (data.time) {
                                timestamp = data.time.toDate ? data.time.toDate() : new Date(data.time);
                            } else {
                                timestamp = new Date();
                            }
                            
                            return {
                                id: doc.id,
                                level: data.level || 'info',
                                message: data.message || '',
                                timestamp: timestamp
                            }
                        });
                        console.log('✅ Logs loaded:', logs.length);
                        callback(logs as Log[])
                    }
                },
                (error) => {
                    console.error('❌ Firestore logs subscription error:', error);
                    if (error.code === 'permission-denied') {
                        console.error('🔒 Check Firestore Security Rules - see FIREBASE_SETUP.md');
                    }
                    if (errorCallback) {
                        errorCallback(error as Error);
                    }
                }
            );
            return unsubscribe;
        } catch (error) {
            console.error('❌ Failed to subscribe to logs:', error);
            if (errorCallback) {
                errorCallback(error as Error);
            }
            return () => {};
        }
    }
}
