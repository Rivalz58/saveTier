import * as tf from "@tensorflow/tfjs";
import ExifReader from "exifreader";
import imageCompression from "browser-image-compression";

// Interface pour les résultats de vérification d'image
export interface ImageVerificationResult {
  isValid: boolean;
  file: File | null;
  errorMessage?: string;
}

// Suppression de la partie modèle NSFW
let nsfwModel = null;

// Fonction conservée par compatibilité mais ne fait plus rien
export const loadNSFWModel = async (): Promise<void> => {
  console.log("Chargement du modèle NSFW désactivé - vérification effectuée par le serveur");
  return;
};

// Fonction conservée par compatibilité mais renvoie toujours false (pas de vérification côté client)
export const checkNSFWContent = async (imageFile: File): Promise<boolean> => {
  console.log("Vérification NSFW désactivée côté client - effectuée par le serveur");
  return false;
};

// Supprimer les métadonnées d'une image
export const removeMetadata = async (file: File): Promise<File> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer);
    console.log("Métadonnées détectées:", tags);
    return file; // Pour l'instant, on retourne simplement le fichier (les métadonnées sont ignorées lors de l'encodage ultérieur)
  } catch (error) {
    console.warn("Erreur lors de la suppression des métadonnées:", error);
    return file;
  }
};

// Compresser une image
export const compressImage = async (file: File): Promise<File | null> => {
  const options = {
    maxSizeMB: 2, // Taille maximale en Mo
    maxWidthOrHeight: 1920, // Taille maximale pour redimensionner
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      "Image compressée:",
      compressedFile.name,
      "Taille:",
      (compressedFile.size / 1024 / 1024).toFixed(2),
      "Mo",
    );
    return compressedFile;
  } catch (error) {
    console.error("Erreur lors de la compression de l'image:", error);
    return null;
  }
};

// Vérifier si la taille de l'image est acceptable
export const isImageUnderLimit = (file: File): boolean => {
  const maxFileSize = 2 * 1024 * 1024; // 2 Mo
  const isUnderLimit = file.size <= maxFileSize;

  if (!isUnderLimit) {
    console.warn(
      `L'image ${file.name} dépasse la limite de taille (${(file.size / 1024 / 1024).toFixed(2)} Mo)`,
    );
  }

  return isUnderLimit;
};

// Vérifier le type de l'image
export const isValidImageType = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const isValid = validTypes.includes(file.type);

  if (!isValid) {
    console.warn(
      `Type de fichier non pris en charge pour ${file.name}: ${file.type}`,
    );
  }

  return isValid;
};

// Traitement complet d'une image avant upload - sans vérification NSFW côté client
export const processImage = async (
  imageFile: File,
): Promise<ImageVerificationResult> => {
  try {
    // 1. Vérifier le type de fichier
    if (!isValidImageType(imageFile)) {
      return {
        isValid: false,
        file: null,
        errorMessage:
          "Type de fichier non pris en charge. Utilisez des images JPG, PNG, GIF ou WebP.",
      };
    }

    // 2. Vérifier si l'image n'est pas trop grande avant compression
    if (imageFile.size > 10 * 1024 * 1024) {
      // 10 Mo
      return {
        isValid: false,
        file: null,
        errorMessage: "Image trop volumineuse (max 10 Mo avant compression).",
      };
    }

    // 3. Suppression de la vérification NSFW côté client (effectuée par le serveur)

    // 4. Supprimer les métadonnées
    const fileWithoutMetadata = await removeMetadata(imageFile);

    // 5. Compresser l'image
    const compressedImage = await compressImage(fileWithoutMetadata);
    if (!compressedImage) {
      return {
        isValid: false,
        file: null,
        errorMessage: "Erreur lors de la compression de l'image.",
      };
    }

    // 6. Vérifier la taille finale
    if (!isImageUnderLimit(compressedImage)) {
      return {
        isValid: false,
        file: null,
        errorMessage:
          "L'image reste trop volumineuse après compression (max 2 Mo).",
      };
    }

    return {
      isValid: true,
      file: compressedImage,
    };
  } catch (error) {
    console.error("Erreur lors du traitement de l'image:", error);
    return {
      isValid: false,
      file: null,
      errorMessage: "Erreur inattendue lors du traitement de l'image.",
    };
  }
};

export default {
  loadNSFWModel,
  processImage,
  checkNSFWContent,
  removeMetadata,
  compressImage,
  isImageUnderLimit,
  isValidImageType,
};