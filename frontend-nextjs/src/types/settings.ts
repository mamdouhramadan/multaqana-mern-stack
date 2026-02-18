/**
 * Public settings from GET /api/settings/public
 */
export interface PublicSettingItem {
  key: string;
  value: unknown;
  category?: string;
  description?: string;
}

export type PublicSettingsMap = Record<string, unknown>;
