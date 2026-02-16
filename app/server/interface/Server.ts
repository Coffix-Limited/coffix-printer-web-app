export type ConnectionType = "bluetooth" | "wifi";

export interface DeviceInfo {
  brand?: string;
  model?: string;
  platform?: string;
}

export interface PosServer {
  id?: string;
  name?: string;
  connectedAt?: Date;
  connectionType?: ConnectionType;
  deviceInfo?: DeviceInfo;
  printerConnected?: boolean;
  printerDocId?: string;
  printerMacAddress?: string;
  printerIpAddress?: string;
  printerId?: string;
  updatedAt?: Date;
  pollingInterval?: number;
  scheduledAt?: Date;
}
