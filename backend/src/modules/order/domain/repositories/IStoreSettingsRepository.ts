import type { StoreSettings, UpdateStoreSettingsInput } from '../entities/StoreSettings';

export interface IStoreSettingsRepository {
  // Get settings (singleton pattern - there's only one store)
  get(): Promise<StoreSettings>;

  // Update settings
  update(input: UpdateStoreSettingsInput): Promise<StoreSettings>;

  // Reset to defaults
  resetToDefaults(): Promise<StoreSettings>;
}