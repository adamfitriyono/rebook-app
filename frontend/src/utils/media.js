/** Base URL backend (tanpa /api). Kosong di dev → pakai origin + Vite proxy. */
export function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Ubah path /uploads/... menjadi URL penuh di production. */
export function resolveMediaUrl(path, fallback = null) {
  if (!path) return fallback;
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const base = getApiBaseUrl();
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
