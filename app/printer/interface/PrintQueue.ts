export enum PrintQueueStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  SCHEDULED = "scheduled",
  ERROR = "failed",
}

export interface PrintQueue {
  /** Firestore document id (same as jobId for docs created with ordinal) */
  id: string;
  /** Ordinal job number for display (e.g. "123" → Job #123) */
  jobId: string;
  label: string; // ORDER #55, INVOICE x10
  printerId: string;
  status: PrintQueueStatus;
  lines: string[];
  printTime: Date;
  templateName: string;
}
