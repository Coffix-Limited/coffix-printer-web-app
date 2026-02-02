"use client"

import { useState, useEffect } from "react";
import { Save, FileText, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { COFFEE_PALETTE } from "@/app/constants/theme";
import { LineDecoration, LineStyle, LineAlignment } from "@/app/templates/interface/LineDecoration";
import { useTemplateStore } from "@/app/templates/store/useTemplateStore";

const SAMPLE_LINES = [
  "COFFEE SHOP",
  "123 Main Street, Auckland",
  "Order #12345",
  "Date: 28 Jan 2026",
  "Cashier: John",
  "2x Flat White - $8.00",
  "1x Long Black - $4.50",
  "1x Cappuccino - $5.00",
  "Subtotal: $17.50",
  "Tax (15%): $2.63",
  "Total: $20.13",
  "Thank you!",
  "Visit us again",
  "www.coffeeshop.com",
  "Scan QR for feedback"
];

const DEFAULT_LINE: LineStyle = {
  fontSize: 14,
  alignment: LineAlignment.LEFT,
  isBold: false
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const { getTemplate, saveTemplate } = useTemplateStore();

  const [lines, setLines] = useState<LineStyle[]>(
    Array(15).fill(null).map(() => ({ ...DEFAULT_LINE }))
  );
  const [selectedLine, setSelectedLine] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId !== 'new') {
        const template = await getTemplate(templateId);
        if (template && template.lines) {
          setLines(template.lines);
        }
      }
      setLoading(false);
    };
    loadTemplate();
  }, [templateId, getTemplate]);

  const handleUpdateLine = (lineIndex: number, updates: Partial<LineStyle>) => {
    setLines(prev => prev.map((line, idx) =>
      idx === lineIndex ? { ...line, ...updates } : line
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const template: LineDecoration = {
        id: templateId === 'new' ? Date.now().toString() : templateId,
        lines: lines
      };
      await saveTemplate(template);
      router.push('/templates');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const getStyleFromLineStyle = (lineStyle: LineStyle) => {
    return {
      fontSize: `${lineStyle.fontSize}px`,
      textAlign: lineStyle.alignment as "left" | "center" | "right",
      fontWeight: lineStyle.isBold ? 'bold' as const : 'normal' as const
    };
  };

  if (loading) {
    return (
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>Loading template...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <button
          onClick={() => router.push('/templates')}
          className="flex items-center gap-2 mb-4 text-sm hover:opacity-70 transition-opacity"
          style={{ color: COFFEE_PALETTE.primary }}
        >
          <ArrowLeft size={16} />
          Back to Templates
        </button>
        <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: COFFEE_PALETTE.textPrimary }}>
          {templateId === 'new' ? 'Create New Template' : 'Edit Template'}
        </h2>
        <p className="text-sm" style={{ color: COFFEE_PALETTE.textSecondary }}>
          Configure line styles for receipt printing • 15 lines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>
              Receipt Lines
            </h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {lines.map((line, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedLine(index)}
                  className="p-3 rounded-md border cursor-pointer transition-all"
                  style={{
                    backgroundColor: selectedLine === index ? COFFEE_PALETTE.background : COFFEE_PALETTE.cardBg,
                    borderColor: selectedLine === index ? COFFEE_PALETTE.primary : COFFEE_PALETTE.border,
                    borderWidth: selectedLine === index ? '2px' : '1px'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: COFFEE_PALETTE.textPrimary }}>
                      Line {index + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      backgroundColor: COFFEE_PALETTE.background,
                      color: COFFEE_PALETTE.textSecondary
                    }}>
                      {line.fontSize}px
                    </span>
                  </div>

                  <div className="text-xs" style={{ color: COFFEE_PALETTE.textSecondary }}>
                    {line.alignment} • {line.isBold ? 'Bold' : 'Normal'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: COFFEE_PALETTE.textPrimary }}>
              Edit Line {selectedLine + 1}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
                  Font Size: {lines[selectedLine].fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={lines[selectedLine].fontSize}
                  onChange={(e) => handleUpdateLine(selectedLine, { fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: COFFEE_PALETTE.textSecondary }}>
                  <span>8px</span>
                  <span>48px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
                  Alignment
                </label>
                <select
                  value={lines[selectedLine].alignment}
                  onChange={(e) => handleUpdateLine(selectedLine, { alignment: e.target.value as LineAlignment })}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: COFFEE_PALETTE.border,
                    color: COFFEE_PALETTE.textPrimary
                  }}
                >
                  <option value={LineAlignment.LEFT}>Left</option>
                  <option value={LineAlignment.CENTER}>Center</option>
                  <option value={LineAlignment.RIGHT}>Right</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lines[selectedLine].isBold}
                    onChange={(e) => handleUpdateLine(selectedLine, { isBold: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium" style={{ color: COFFEE_PALETTE.textPrimary }}>
                    Bold Text
                  </span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-md font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: COFFEE_PALETTE.success }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Template</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="p-6 rounded-lg shadow-sm border sticky top-4" style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: COFFEE_PALETTE.primary }} />
              <h3 className="text-lg font-semibold" style={{ color: COFFEE_PALETTE.textPrimary }}>
                Receipt Preview
              </h3>
            </div>

            <div
              className="rounded-lg border-2 p-8 font-mono bg-white min-h-[600px]"
              style={{ borderColor: COFFEE_PALETTE.border }}
            >
              {SAMPLE_LINES.map((text, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedLine(index)}
                  className="cursor-pointer hover:bg-yellow-50 transition-colors px-2 py-1 rounded mb-1"
                  style={{
                    backgroundColor: selectedLine === index ? '#FEF3C7' : 'transparent'
                  }}
                >
                  <div
                    style={{
                      ...getStyleFromLineStyle(lines[index]),
                      color: COFFEE_PALETTE.textPrimary
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: COFFEE_PALETTE.background }}>
              <p className="text-xs font-medium mb-2" style={{ color: COFFEE_PALETTE.textPrimary }}>
                Preview Notes:
              </p>
              <ul className="text-xs space-y-1" style={{ color: COFFEE_PALETTE.textSecondary }}>
                <li>• Click on any line to edit its style</li>
                <li>• Each line can have independent styling</li>
                <li>• Highlighted line indicates current selection</li>
                <li>• Changes are reflected in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
