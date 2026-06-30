export const WIKIMEDIA_QUERIES = {
  /** Image-rich query expected to return many results. */
  valid: 'sunset',
  /** Nonsense string — should return zero results. */
  noResults: 'zzzzxxx123abc',
  /** Empty string — tests empty-query submission behaviour (BUG-M01). */
  empty: '',
  /** CJK characters — tests multi-byte / East Asian character handling (TC-M10). */
  cjk: '日本語',
  /** Arabic RTL input — tests right-to-left query handling (TC-M11). */
  rtl: 'صورة',
} as const;

export const WIKIMEDIA_URLS = {
  /** Permanently stable file used for image detail tests — the Commons site logo. */
  stableFile: '/wiki/File:Commons-logo.svg',
  /** Category with a known text description — used to verify description display (TC-M09, #5621). */
  categoryPage: '/wiki/Category:Sunsets',
  /** Standard login page — used for auth flow tests (TC-M12). */
  loginPage: '/wiki/Special:UserLogin',
  /** Upload wizard — should gate anonymous users to login rather than blank (TC-M13). */
  uploadWizard: '/wiki/Special:UploadWizard',
} as const;
