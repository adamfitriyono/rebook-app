import { CONDITION_LABELS } from '../../utils/constants';

function FormSection({ title, children }) {
  return (
    <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700 first:border-0 first:pt-0">
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      {children}
    </div>
  );
}

export default function ListingFormFields({ register, errors, categories, categoriesLoading }) {
  return (
    <>
      <FormSection title="Informasi Buku">
        <div>
          <label className="block text-sm font-medium mb-1">Judul Buku</label>
          <input {...register('title', { required: 'Judul wajib diisi' })} className="input-field" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Penulis</label>
            <input {...register('author')} className="input-field" placeholder="Opsional" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISBN</label>
            <input {...register('isbn')} className="input-field" placeholder="Opsional" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kondisi</label>
            <select {...register('condition', { required: true })} className="input-field">
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select {...register('category', { required: true })} className="input-field" disabled={categoriesLoading}>
              {categories.length === 0 && <option value="">Memuat...</option>}
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Deskripsi">
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi Produk</label>
          <textarea
            {...register('description', { required: 'Deskripsi wajib diisi' })}
            rows={10}
            className="input-field min-h-[220px] resize-y"
            placeholder="Jelaskan kondisi halaman, edisi, tahun terbit, alasan dijual, dan detail lain yang relevan..."
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          <p className="text-xs text-subtle mt-1">
            Semakin detail, semakin mudah pembeli memutuskan.
          </p>
        </div>
      </FormSection>

      <FormSection title="Harga & Stok">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
            <input type="number" {...register('price', { required: true, min: 1 })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stok</label>
            <input
              type="number"
              defaultValue={1}
              {...register('stock', { required: true, min: 1, valueAsNumber: true })}
              className="input-field"
            />
            <p className="text-xs text-subtle mt-1">Buku bekas biasanya 1 eksemplar per listing.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Diskon (%)</label>
            <input
              type="number"
              min={0}
              max={99}
              {...register('discountPercent', { min: 0, max: 99 })}
              placeholder="Opsional"
              className="input-field"
            />
          </div>
        </div>
        <p className="text-xs text-subtle">Diskon 0–99, kosongkan jika tidak ada.</p>
      </FormSection>

      <FormSection title="Spesifikasi Pengiriman">
        <p className="text-xs text-subtle -mt-2">
          Opsional. Membantu pembeli estimasi ongkir. Contoh novel: ±300 gr, 20×13×2 cm.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">Berat Paket (gram)</label>
          <input
            type="number"
            min={0}
            max={50000}
            {...register('weightGram', { min: 0, max: 50000 })}
            placeholder="Contoh: 350"
            className="input-field max-w-xs"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dimensi Paket (cm)</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                step="0.1"
                min={0}
                {...register('lengthCm', { min: 0 })}
                placeholder="P"
                className="input-field"
                aria-label="Panjang cm"
              />
              <p className="text-xs text-subtle mt-1 text-center">Panjang</p>
            </div>
            <div>
              <input
                type="number"
                step="0.1"
                min={0}
                {...register('widthCm', { min: 0 })}
                placeholder="L"
                className="input-field"
                aria-label="Lebar cm"
              />
              <p className="text-xs text-subtle mt-1 text-center">Lebar</p>
            </div>
            <div>
              <input
                type="number"
                step="0.1"
                min={0}
                {...register('heightCm', { min: 0 })}
                placeholder="T"
                className="input-field"
                aria-label="Tinggi cm"
              />
              <p className="text-xs text-subtle mt-1 text-center">Tinggi</p>
            </div>
          </div>
        </div>
      </FormSection>
    </>
  );
}
