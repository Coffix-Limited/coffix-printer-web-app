export interface Printer {
  id: string; // AUK, TUR, etc.
  location: string;
  isOnline: boolean;
  /** Server document id of the latest connected POS (when isOnline from server). */
  connectedServerId?: string;

  /**
   * Template name used for printing receipts.
   * @example "default", "receipt", "invoice", "packing-slip", etc.
   * points in [lineDecoration] collection
   */
  templateName: string;
  createdAt: Date;
  isVisible: boolean;
}
