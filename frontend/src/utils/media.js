/** Base URL backend (tanpa /api). Kosong di dev → pakai origin + Vite proxy. */
export function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Avatar default untuk semua user (pembeli, penjual, admin). */
export const DEFAULT_AVATAR = '/images/user-pic-default.svg';

/** Sisipkan transform Cloudinary untuk gambar lebih ringan. */
export function optimizeCloudinaryUrl(url, { width, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx + marker.length);
  const suffix = url.slice(idx + marker.length);

  if (/^(w_|c_|q_|f_|g_)/.test(suffix)) return url;

  const transforms = [`w_${width}`, `q_${quality}`, `f_${format}`].filter(Boolean).join(',');
  if (!transforms) return url;

  return `${prefix}${transforms}/${suffix}`;
}

/** Resolve URL avatar; jatuh ke gambar default jika kosong. */
export function resolveAvatarUrl(path, { width = 80 } = {}) {
  return resolveMediaUrl(path, DEFAULT_AVATAR, { width });
}

/**
 * Ubah path /uploads/... menjadi URL penuh.
 * @param {string|null} path
 * @param {string|null} fallback
 * @param {{ width?: number }} [options] — width untuk optimasi Cloudinary
 */
export function resolveMediaUrl(path, fallback = null, options = {}) {
  if (!path) return fallback;
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return options.width ? optimizeCloudinaryUrl(path, { width: options.width }) : path;
  }

  const base = getApiBaseUrl();
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  return options.width ? optimizeCloudinaryUrl(url, { width: options.width }) : url;
}
