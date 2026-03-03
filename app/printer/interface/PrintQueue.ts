export enum PrintQueueStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  SCHEDULED = "scheduled",
  ERROR = "error",
}

export interface PrintQueue {
  id: string;
  printerId: string;
  /** Optional for backward compatibility with existing docs */
  printerName?: string;
  createdAt: Date;
  status: PrintQueueStatus;
  lines: string[];
  printTime: Date;
}
