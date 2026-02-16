export interface Printer {
  id: string;
  label: string;
  location: string;
  isOnline: boolean;
  /** Server document id of the latest connected POS (when isOnline from server). */
  connectedServerId?: string;
  printerId: string;
  lineDecorationId: string;
  createdAt: Date;
  isVisible: boolean;
}
