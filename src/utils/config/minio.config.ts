/**
 * Configuration des routes Minio pour l'organisation des fichiers
 */

export const MINIO_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_MINIO_URL || "https://s3.loco-trip.com",
  bucket: process.env.NEXT_PUBLIC_MINIO_BUCKET || "locotrip",
} as const;

/**
 * Routes des dossiers Minio par type de ressource
 */
export const MINIO_ROUTES = {
  GUIDE_IMAGES: "profiles/guides/images",
  GUIDE_DOCUMENTS: "profiles/guides/documents",
  USER_PROFILES: "profiles/users",
  EXPERIENCES: "experiences",

} as const;

/**
 * Images par défaut quand aucune image n'est disponible
 */
export const DEFAULT_IMAGES = {
  GUIDE_PROFILE: "/assets/guide-pp-default.avif",
  USER_PROFILE: "/assets/user-pp-default.avif",
  EXPERIENCE: "/assets/experience-default.avif",
} as const;
