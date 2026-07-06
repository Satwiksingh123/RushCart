// Look up unknown barcodes in the public Open Food Facts database so that
// "any product" can be scanned, not just the ones seeded in our own DB.
// Docs: https://world.openfoodfacts.org/data

export interface ExternalProductInfo {
  barcode: string;
  name: string;
  image_url: string | null;
  weight: string | null;
}

/**
 * Fetch product details for a barcode from Open Food Facts.
 * Returns null if the barcode is unknown or the request fails — callers
 * should treat null as "not found".
 */
export async function fetchFromOpenFoodFacts(
  barcode: string
): Promise<ExternalProductInfo | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
    );
    if (!res.ok) return null;

    const json = await res.json();
    // status === 1 means the product exists in the database
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    const brand: string = (p.brands || '').split(',')[0]?.trim() || '';
    const baseName: string =
      (p.product_name || '').trim() ||
      (p.product_name_en || '').trim() ||
      (p.generic_name || '').trim() ||
      brand;

    if (!baseName) return null;

    // Prefix the brand when the name doesn't already contain it
    // e.g. name "Original" + brand "Oreo" -> "Oreo Original"
    const name =
      brand && !baseName.toLowerCase().includes(brand.toLowerCase())
        ? `${brand} ${baseName}`
        : baseName;

    return {
      barcode,
      name,
      image_url:
        p.image_front_url || p.image_url || p.image_front_small_url || null,
      weight: (p.quantity || '').trim() || null,
    };
  } catch (err) {
    console.error('Open Food Facts lookup failed:', err);
    return null;
  }
}
