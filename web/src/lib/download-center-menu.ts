/** Keys exposed under Download center in the sidebar (`/download-center/module/[key]`). */
export const DOWNLOAD_CENTER_SIDEBAR_KEYS = new Set([
  "content-type",
  "content-list",
  "shared-content-list",
  "video-list",
]);

export function isDownloadCenterSidebarModuleKey(key: string): boolean {
  return DOWNLOAD_CENTER_SIDEBAR_KEYS.has(key);
}
