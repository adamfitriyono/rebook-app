import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  if (!products?.length) {
    return (
      <div className="text-center py-12 text-subtle">
        Tidak ada produk ditemukan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
