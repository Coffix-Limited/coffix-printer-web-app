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
  printerMacAddress?: string;
  printerIpAddress?: string;
  printerId?: string; // Printer ID (e.g. AUK, TUR, etc.)
  updatedAt?: Date;
  pollingInterval?: number;
}
