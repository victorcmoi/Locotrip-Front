import { MINIO_CONFIG, MINIO_ROUTES, DEFAULT_IMAGES } from "./config/minio.config";

/**
 * Construit l'URL complète pour accéder à une image sur Minio
 * @param path - Le chemin du fichier (ex: "photo-123.avif" ou chemin complet)
 * @param folder - Le dossier Minio à utiliser (depuis MINIO_ROUTES)
 * @param defaultImage - Image par défaut si path est null/undefined
 * @returns L'URL complète de l'image
 */
export function getMinioUrl(
  path?: string | null,
  folder?: string,
  defaultImage: string = DEFAULT_IMAGES.GUIDE_PROFILE
): string {
  if (!path) {
    return defaultImage;
  }

  // Si le path commence déjà par http, c'est déjà une URL complète
  if (path.startsWith("http")) {
    return path;
  }

  // Si un dossier est spécifié et que le path ne contient pas de slash (juste un nom de fichier)
  const fullPath = folder && !path.includes("/")
    ? `${folder}/${path}`
    : path;

  return `${MINIO_CONFIG.baseUrl}/${MINIO_CONFIG.bucket}/${fullPath}`;
}

/**
 * Helpers spécifiques pour chaque type de ressource
 */
export const MinioHelpers = {
  /**
   * URL pour une photo de profil de guide
   * @param guideId - L'ID du guide
   * @param fileName - Le nom du fichier ou l'URL complète (optionnel, si non fourni retourne l'image par défaut)
   */
  guideProfile: (guideId?: string, fileName?: string | null) => {
    if (!guideId || !fileName) {
      return DEFAULT_IMAGES.GUIDE_PROFILE;
    }
    if (fileName.startsWith('http')) {
      return fileName;
    }
    return `${MINIO_CONFIG.baseUrl}/${MINIO_CONFIG.bucket}/${MINIO_ROUTES.GUIDE_PROFILE_PICTURES}/${fileName}`;
  },

  /**
   * URL pour une photo supplémentaire d'un guide
   * @param guideId - L'ID du guide
   * @param fileName - Le nom du fichier
   */
  guidePicture: (guideId: string, fileName: string) =>
    `${MINIO_CONFIG.baseUrl}/${MINIO_CONFIG.bucket}/${MINIO_ROUTES.GUIDE_PICTURES}/${guideId}/${fileName}`,

  /**
   * URLs pour toutes les photos d'un guide
   * @param guideId - L'ID du guide
   * @param fileNames - Tableau des noms de fichiers
   */
  guidePictures: (guideId: string, fileNames: string[]) =>
    fileNames.map(fileName => MinioHelpers.guidePicture(guideId, fileName)),

  /**
   * URL pour un document de guide (carte pro, justificatifs, etc.)
   */
  guideDocument: (documentPath?: string | null) =>
    getMinioUrl(documentPath, MINIO_ROUTES.GUIDE_DOCUMENTS),

  /**
   * URL pour une photo de profil d'utilisateur/voyageur
   */
  userProfile: (photoPath?: string | null) =>
    getMinioUrl(photoPath, MINIO_ROUTES.USER_PROFILES, DEFAULT_IMAGES.USER_PROFILE),

  /**
   * URL pour une photo d'expérience
   */
  experience: (photoPath?: string | null) =>
    getMinioUrl(photoPath, MINIO_ROUTES.EXPERIENCES, DEFAULT_IMAGES.EXPERIENCE),
};

