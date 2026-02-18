export type ApplicationStatus = "active" | "inactive" | "maintenance";

export interface MobileAppInfo {
  platform: "ios" | "android";
  storeName: "App Store" | "Google Play";
  storeUrl: string;
  qrValue?: string; // Optional override for QR code content
}

export interface Attachment {
  name: string;
  url: string;
}

export interface ApplicationDetails {
  id: number;
  title: string;
  logoUrl: string;
  status: ApplicationStatus;
  url: string;
  supportEmail?: string;
  isInternal?: boolean;
  description?: string;
  department?: string;
  technicalOwner?: string;
  mobileApps?: MobileAppInfo[];
  attachments?: Attachment[];
}
