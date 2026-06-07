import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from '../../store/useToastStore';

export const MAX_LISTING_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ImageFilePicker({
  files,
  onChange,
  existingCount = 0,
  label = 'Foto Produk',
  hint = 'Maksimal 5 foto, maks 5MB per file',
}) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const next = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  const handleAdd = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const combined = [...files, ...picked];
    if (existingCount + combined.length > MAX_LISTING_IMAGES) {
      toast.error(`Maksimal ${MAX_LISTING_IMAGES} foto`);
      e.target.value = '';
      return;
    }

    for (const file of picked) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Ukuran foto maksimal 5MB');
        e.target.value = '';
        return;
      }
    }

    onChange(combined);
    e.target.value = '';
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        className="input-field"
        disabled={existingCount + files.length >= MAX_LISTING_IMAGES}
      />
      <p className="text-xs text-subtle mt-1">{hint}</p>
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-20 h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                aria-label="Hapus foto"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
