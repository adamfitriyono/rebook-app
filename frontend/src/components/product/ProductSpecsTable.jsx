import { formatPackageDimensions } from '../../utils/productSpecs';

export default function ProductSpecsTable({ product }) {
  const dimensions = formatPackageDimensions(product);
  const rows = [
    product.isbn && { label: 'ISBN', value: product.isbn },
    product.weightGram && { label: 'Berat paket', value: `${product.weightGram} gram` },
    dimensions && { label: 'Dimensi paket', value: dimensions },
    product.category && { label: 'Kategori', value: product.category },
  ].filter(Boolean);

  if (!rows.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              <th className="text-left font-medium text-subtle px-4 py-2.5 w-2/5 bg-gray-50/80 dark:bg-gray-800/40">
                {label}
              </th>
              <td className="text-heading px-4 py-2.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
