export function formatPackageDimensions(product) {
  const { lengthCm, widthCm, heightCm } = product || {};
  const parts = [lengthCm, widthCm, heightCm].filter((v) => v != null && v > 0);
  if (!parts.length) return null;
  return `${parts.join(' × ')} cm`;
}

export function hasProductSpecs(product) {
  if (!product) return false;
  return Boolean(
    product.isbn
    || product.weightGram
    || product.lengthCm
    || product.widthCm
    || product.heightCm
  );
}
