export enum PrintQueueStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    ERROR = 'error'
}

export interface PrintQueue {
    id: string;
    printerId: string;
    createdAt: Date;
    status: PrintQueueStatus;
    lines: string[];
}