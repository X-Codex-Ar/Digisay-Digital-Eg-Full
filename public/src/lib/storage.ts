/**
 * DigiSay Unified Media & Storage Resolver
 *
 * Seamlessly resolves asset URLs across local static assets and Supabase Storage CDN.
 */

const SUPABASE_STORAGE_URL = (
  import.meta.env.VITE_SUPABASE_STORAGE_URL || ""
).replace(/\/$/, "");

export const PUBLIC_MEDIA_BUCKET = "public-media";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "origin" | "avif" | "webp";
  resize?: "cover" | "contain" | "fill";
}

/**
 * Resolves an asset path to either the Supabase Storage CDN (if configured)
 * or the local static assets directory fallback.
 *
 * @param path Relative path (e.g., "brand/Digisay-logo-big.jpg")
 * @param bucket Storage bucket name (defaults to 'public-media')
 * @param fallback Optional explicit fallback URL
 */
export function resolveMediaUrl(
  path: string,
  bucket: string = PUBLIC_MEDIA_BUCKET,
  fallback?: string
): string {
  const cleanPath = path.replace(/^\/+/, "");

  if (SUPABASE_STORAGE_URL) {
    return `${SUPABASE_STORAGE_URL}/${bucket}/${cleanPath}`;
  }

  if (fallback) {
    return fallback;
  }

  // Fallback to local Vite-served static assets
  return `/assets/${cleanPath}`;
}

/**
 * Resolves a video asset URL, falling back gracefully to a remote or local default.
 */
export function resolveVideoUrl(path: string, fallbackUrl: string): string {
  const cleanPath = path.replace(/^\/+/, "");

  if (SUPABASE_STORAGE_URL) {
    return `${SUPABASE_STORAGE_URL}/${PUBLIC_MEDIA_BUCKET}/${cleanPath}`;
  }

  return fallbackUrl;
}

/**
 * Generates an edge-transformed image URL when using Supabase Image Transformation.
 */
export function getTransformedImageUrl(
  path: string,
  options: ImageTransformOptions = {},
  bucket: string = PUBLIC_MEDIA_BUCKET
): string {
  const baseUrl = resolveMediaUrl(path, bucket);

  if (!SUPABASE_STORAGE_URL) {
    return baseUrl;
  }

  // Supabase Image Transformation endpoint structure: /render/image/public/{bucket}/{path}
  const transformEndpoint = SUPABASE_STORAGE_URL.replace(
    /\/v1\/object\/public$/,
    "/v1/render/image/public"
  );

  const cleanPath = path.replace(/^\/+/, "");
  const queryParams = new URLSearchParams();

  if (options.width) queryParams.set("width", options.width.toString());
  if (options.height) queryParams.set("height", options.height.toString());
  if (options.quality) queryParams.set("quality", options.quality.toString());
  if (options.format) queryParams.set("format", options.format);
  if (options.resize) queryParams.set("resize", options.resize);

  const queryString = queryParams.toString();
  return `${transformEndpoint}/${bucket}/${cleanPath}${queryString ? `?${queryString}` : ""}`;
}
