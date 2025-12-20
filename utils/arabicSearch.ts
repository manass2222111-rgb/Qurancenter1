
/**
 * Normalizes Arabic text for smarter searching.
 * Handles variations of Alif, Teh Marbuta, Yeh, etc.
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";
  return text
    .trim()
    .replace(/[\u064B-\u0652]/g, "") // Remove Harakat
    .replace(/[أإآ]/g, "ا") // Standardize Alif
    .replace(/ة/g, "ه") // Teh Marbuta -> Heh
    .replace(/[ىي]/g, "ي") // Yeh/Alef Maksura -> Yeh
    .replace(/\s+/g, " "); // Normalize spaces
};

/**
 * Checks if query exists in target string using normalized Arabic logic
 */
export const smartMatch = (target: string, query: string): boolean => {
  if (!query) return true;
  if (!target) return false;
  
  const normalizedTarget = normalizeArabic(target);
  const normalizedQuery = normalizeArabic(query);
  
  return normalizedTarget.includes(normalizedQuery);
};
