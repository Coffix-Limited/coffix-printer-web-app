"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTemplateStore } from "./store/useTemplateStore";
import { COFFEE_PALETTE } from "../constants/theme";
import { Plus, Trash2, FileText, AlertCircle, Activity, Edit } from "lucide-react";
import TemplatePreview from "./components/TemplatePreview";

export default function TemplatesPage() {
  const router = useRouter();
  const { lineDecorations, setLineDecorations, loading, error, deleteTemplate } = useTemplateStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLineDecorations();
  }, [setLineDecorations]);

  const handleCreateTemplate = async () => {
    router.push('/templates/new');
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeletingId(id);
    try {
      await deleteTemplate(id);
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
            Receipt Templates
          </h2>
          <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
            Manage and configure receipt printing templates • {lineDecorations.length} template{lineDecorations.length !== 1 ? 's' : ''}
          </p>
        </div>
        {/* <button
          onClick={handleCreateTemplate}
          className="px-4 py-2 rounded-md font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: COFFEE_PALETTE.primary }}
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Template</span>
        </button> */}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border flex items-start gap-3"
          style={{ backgroundColor: COFFEE_PALETTE.warningBg, borderColor: COFFEE_PALETTE.error }}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: COFFEE_PALETTE.error }} />
          <div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
              Firebase Connection Error
            </h4>
            <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: COFFEE_PALETTE.primary }} />
            <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>Loading templates...</p>
          </div>
        </div>
      )}

      {!loading && !error && lineDecorations.length === 0 && (
        <div className="p-12 rounded-lg border-2 border-dashed text-center"
          style={{ borderColor: COFFEE_PALETTE.border }}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: COFFEE_PALETTE.textSecondary }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
            No Templates Found
          </h3>
          <p className="text-sm mb-4" style={{ color: COFFEE_PALETTE.textSecondary }}>
            Create your first receipt template to get started
          </p>
          <button
            onClick={handleCreateTemplate}
            className="px-6 py-2 rounded-md font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: COFFEE_PALETTE.primary }}
          >
            Create Template
          </button>
        </div>
      )}

      {!loading && !error && lineDecorations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lineDecorations.map((lineDecoration) => (
            <div
              key={lineDecoration.id}
              className="rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-md"
              style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}
            >
              <div className="p-4 border-b" style={{ borderColor: COFFEE_PALETTE.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: COFFEE_PALETTE.primary }} />
                    <h3 className="font-semibold text-base" style={{ color: COFFEE_PALETTE.textPrimary }}>
                      Template {lineDecoration.id.slice(0, 8)}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded" style={{
                    backgroundColor: COFFEE_PALETTE.background,
                    color: COFFEE_PALETTE.textSecondary
                  }}>
                    15 lines
                  </span>
                </div>
              </div>

              <div className="p-4 overflow-hidden">
                <TemplatePreview
                  lines={lineDecoration.lines}
                  minHeight="320px"
                />
              </div>

              <div className="p-3 border-t flex items-center justify-between gap-2"
                style={{ borderColor: COFFEE_PALETTE.border }}>
                <button
                  onClick={() => router.push(`/templates/${lineDecoration.id}`)}
                  className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: COFFEE_PALETTE.primary,
                    color: '#FFFFFF'
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(lineDecoration.id);
                  }}
                  disabled={deletingId === lineDecoration.id}
                  className="p-2 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{
                    backgroundColor: '#FFEBEE',
                    color: COFFEE_PALETTE.error
                  }}
                >
                  {deletingId === lineDecoration.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}