export enum PrintQueueStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
}

export interface PrintQueue {
    id: string;
    printerId: string;
    createdAt: Date;
    status: PrintQueueStatus;
    lines: string[];
    serviceTime: Date;
}