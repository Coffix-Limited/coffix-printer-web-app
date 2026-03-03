export enum LineAlignment {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
}

export interface LineDecoration {
    id: string
    lines: LineStyle[]
    templateName: string; // (e.g. default, receipt, invoice, packing-slip, etc.)
} 
// The definition of what a "Line" looks like
export interface LineStyle {
    fontSize: number;        // per pixel
    alignment: LineAlignment;
    isBold: boolean;         // Added boolean for extra emphasis
}