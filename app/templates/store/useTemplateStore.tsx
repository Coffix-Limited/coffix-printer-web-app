import { create } from "zustand";
import { Unsubscribe } from "firebase/firestore";
import { LineDecoration } from "../interface/LineDecoration";
import { LineDecorationService } from "../service/line_decoration_service";

interface TemplateStore {
    unsubscribe: Unsubscribe | null;
    lineDecorations: LineDecoration[];
    loading: boolean;
    error: string | null;
    setLineDecorations: () => void;
    deleteTemplate: (id: string) => Promise<void>;
    getTemplate: (id: string) => Promise<LineDecoration | null>;
    saveTemplate: (template: LineDecoration) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
    unsubscribe: null,
    lineDecorations: [],
    loading: false,
    error: null,
    setLineDecorations: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null })
        }

        set({ loading: true, error: null });

        const unsubscribeListener = LineDecorationService.subscribeToTemplates(
            (lineDecorations) => {
                console.log("Templates fetched...", lineDecorations.length)
                set({ lineDecorations, loading: false, error: null })
            },
            (error) => {
                console.error("Template subscription error:", error);
                set({ error: error.message || 'Failed to load line decorations', loading: false, lineDecorations: [] })
            }
        );

        set({ unsubscribe: unsubscribeListener });
    },
    deleteTemplate: async (id: string) => {
        try {
            await LineDecorationService.deleteTemplate(id);
        } catch (error) {
            console.error("Failed to delete template:", error);
            throw error;
        }
    },
    getTemplate: async (id: string) => {
        const { lineDecorations } = get();
        const template = lineDecorations.find(t => t.id === id);
        if (template) return template;

        try {
            return await LineDecorationService.getTemplate(id);
        } catch (error) {
            console.error("Failed to get template:", error);
            return null;
        }
    },
    saveTemplate: async (template: LineDecoration) => {
        try {
            await LineDecorationService.updateTemplate(template);
        } catch (error) {
            console.error("Failed to save template:", error);
            throw error;
        }
    }
}));