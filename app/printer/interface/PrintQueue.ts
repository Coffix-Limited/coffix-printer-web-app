export enum PrintQueueStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  SCHEDULED = "scheduled",
  ERROR = "error",
}

export interface PrintQueue {
  id: string;
  printerId: string; // AUK, TUR, etc.
  status: PrintQueueStatus;
  lines: string[];
  printTime: Date;
  templateName: string;
}
