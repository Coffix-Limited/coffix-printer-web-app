import { LineStyle } from "./LineDecoration";

export interface ReceiptLine {
  text?: string;
  leftText?: string;
  rightText?: string;
  placeholders?: Record<string, string>;
}

export interface Receipt {
  receiptId: string;
  lineDecorationId: string;
  lines: LineStyle[];
  createdAt: Date;
}
