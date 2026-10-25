/**
 * Maps a given Checkout ID (SKU) to the corresponding product bottle image.
 * Images are located in /nextgen_img/ (public directory).
 * 
 * @param {string} sku - The Checkout ID or SKU
 * @returns {string|null} - Path to the image or null if not found
 */
export const getImageBySku = (sku) => {
  const getUrl = (filename) => {
    return `${process.env.PUBLIC_URL || ''}/nextgen_img/${filename.replace(/ /g, '%20').replace(/\+/g, '%2B')}`;
  };

  if (!sku) return getUrl("blank img.png");
  const s = sku.toUpperCase();

  // Weight Loss
  if (s.startsWith("SEMA-") || s.startsWith("SG-MAINT-")) return getUrl("Semaglutide.png");
  if (s.startsWith("TIRZ-") || s.startsWith("TZ-MAINT-")) return getUrl("Tirzepatide.png");
  if (s.startsWith("CRM-ANTIAGE-METFORM-") || s.startsWith("METFORM-")) return getUrl("metformin.png");

  // Hormone Optimization
  if (s.startsWith("SERM-")) return getUrl("sermorelin-.png");

  // Longevity / Wellness
  if (s.startsWith("CRM-NAD-INJ-")) return getUrl("NAD+ Injectable.png");
  if (s.startsWith("CRM-GLUTATH-") || s.startsWith("GLUTA-")) return getUrl("Glutathione.png");
  if (s.startsWith("CRM-B12-INJ-")) return getUrl("B12 Injectable.png");

  // Sexual Wellness
  if (s.startsWith("SILD-")) return getUrl("Erectile_Dysfunction_sildenafil.png");
  if (s.startsWith("TADA-")) return getUrl("Erectile Dysfunction-tadalafil.png");
  if (s.startsWith("SERT-")) return getUrl("premature-ejaculation.png");
  if (s.startsWith("CRM-PT141-INJ-")) return getUrl("pt141.png");

  if (s.startsWith("VALACYCLOVIR500MG") || s.startsWith("VALACYCLOVIR1G")) return getUrl("Herpes.png");
  if (s === "VALA-1G-24") return getUrl("Cold Sores.png");

  // Hair & Skin
  if (s.startsWith("FINA-1MG-")) return getUrl("Men's Hair Loss.png");
  if (s.startsWith("MIN-1MG-") || s.startsWith("FINA-10-MINO-")) return getUrl("Women's Hair Loss.png");
  if (s.startsWith("BIMA-5ML-")) return getUrl("Eyelash Treatment.png");
  if (s.startsWith("TRE-NIA-") || s.startsWith("HYD-VIT-") || s.startsWith("HYD-TRE-")) return getUrl("Skincare.png");

  // Lifestyle Essentials
  const birthControlSkus = [
    "NSEE", "GOTCLIN", "GOTLO", "SPREC", "TRITEC", "TRILOTEC", "GENMIN",
    "OCLLA", "GENGEN", "APRI", "ISOM", "GENTTE", "KAVA", "GENONOR",
    "CMILA", "HTHER", "GENIN21", "MITIN", "GENYAZ"
  ];
  if (birthControlSkus.includes(s)) return getUrl("Birth Control.png");

  if (s.startsWith("OMEPRAZOLE")) return getUrl("Acid Reflux.png");
  if (s.startsWith("BUPROPIONSR150MG")) return getUrl("smoking-cessation.png");
  if (s.startsWith("BUPROPION")) return getUrl("Smoking Cessation.png");

  return getUrl("blank img.png");
};
