import { addDoc, collection, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebase.browser";
import { Printer } from "../interface/Printer";
import { doc, updateDoc } from "firebase/firestore";


export const PrinterService = {

    subscribeToPrinters(
        callback: (printer: Printer[]) => void,
        errorCallback?: (error: Error) => void
    ): (() => void) {
        try {
        const collectionRef = collection(db, "printer")
            const unsubscribe = onSnapshot(
                collectionRef, 
                (snapshot) => {
            if (snapshot.empty) {
                        console.log('📭 No printers found in Firestore');
                callback([])
            } else {
                const printer = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                        console.log('✅ Printers loaded:', printer.length);
                callback(printer as Printer[])
            }
                },
                (error) => {
                    console.error('❌ Firestore subscription error:', error);
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
            console.error('❌ Failed to subscribe to printers:', error);
            if (errorCallback) {
                errorCallback(error as Error);
            }
            return () => {};
        }
    },

    async addPrinter({
        label,
        location
    }: {
        label: string,
        location: string
    }): Promise<void> {
        try {
            const docRef = doc(collection(db, "printer"));
            await setDoc(docRef, {
                id: docRef.id,
                label,
                location,
                isOnline: false
            }, { merge: true });
            console.log('✅ Printer added:', label);
        } catch (error) {
            console.error('❌ Failed to add printer:', error);
            throw error;
        }
    },

    async updatePrinter(printer: Printer): Promise<void> {
        try {
            const printerRef = doc(db, "printer", printer.id);
            await updateDoc(printerRef, {
                label: printer.label,
                location: printer.location,
                isOnline: printer.isOnline,
                lineDecorationId: printer.lineDecorationId || "",
            });
            console.log('✅ Printer updated:', printer.id);
        } catch (error) {
            console.error('❌ Failed to update printer:', error);
            throw error;
        }
    }
}