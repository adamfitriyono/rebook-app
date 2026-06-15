export function isProductSoldOut(product) {
  if (!product) return false;
  return product.stock <= 0 || product.available === false;
}
