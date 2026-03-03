import { db } from "@/app/utils/firebase.browser";
import { LineDecoration, LineAlignment, LineStyle } from "../interface/LineDecoration";
import { addDoc, collection, onSnapshot, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

const DEFAULT_LINES: LineStyle[] = Array(15).fill(null).map(() => ({
    fontSize: 14,
    alignment: LineAlignment.LEFT,
    isBold: false
}));

export const LineDecorationService = {
    subscribeToTemplates(
        callback: (lineDecorations: LineDecoration[]) => void,
        errorCallback?: (error: Error) => void
    ): (() => void) {
        try {
            const collectionRef = collection(db, "lineDecoration");
            const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
                const lineDecorations = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        // Prefer templateName, fall back to legacy `name`
                        templateName: data.templateName || data.name || "",
                        lines: data.lines || DEFAULT_LINES,
                    } as LineDecoration;
                });
                callback(lineDecorations);
            }, (error) => {
                console.error("Firestore line decorations subscription error:", error);
                if (errorCallback) {
                    errorCallback(error as Error);
                }
            });

            return unsubscribe;
        } catch (error) {
            console.error("Failed to subscribe to line decorations:", error);
            if (errorCallback) {
                errorCallback(error as Error);
            }
            return () => { };
        }
    },

    async createTemplate(name: string): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "lineDecoration"), {
                templateName: name,
                lines: DEFAULT_LINES,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("✅ Line Decoration created:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("❌ Failed to create line decoration:", error);
            throw error;
        }
    },

    async getTemplate(id: string): Promise<LineDecoration | null> {
        try {
            const docRef = doc(db, "lineDecoration", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    templateName: data.templateName || data.name || "",
                    lines: data.lines || DEFAULT_LINES
                } as LineDecoration;
            }
            return null;
        } catch (error) {
            console.error("❌ Failed to get template:", error);
            throw error;
        }
    },

    async updateTemplate(template: LineDecoration): Promise<void> {
        try {
            const docRef = doc(db, "lineDecoration", template.id);
            await setDoc(docRef, {
                templateName: template.templateName,
                lines: template.lines,
                updatedAt: new Date()
            }, { merge: true });
            console.log("✅ Template updated:", template.id);
        } catch (error) {
            console.error("❌ Failed to update template:", error);
            throw error;
        }
    },

    async deleteTemplate(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "lineDecoration", id));
            console.log("✅ Template deleted:", id);
        } catch (error) {
            console.error("❌ Failed to delete template:", error);
            throw error;
        }
    }
}