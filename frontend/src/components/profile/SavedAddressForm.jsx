import AddressAutocomplete from '../common/AddressAutocomplete';

export default function SavedAddressForm({
  values,
  onChange,
  showLabel = true,
  showRecipient = false,
  showDefaultToggle = false,
}) {
  const update = (field, value) => onChange({ ...values, [field]: value });

  return (
    <div className="space-y-4">
      {showLabel && (
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            value={values.label || ''}
            onChange={(e) => update('label', e.target.value)}
            className="input-field"
            placeholder="Contoh: Rumah, Kantor"
          />
        </div>
      )}

      {showRecipient && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Penerima</label>
            <input
              value={values.recipientName || ''}
              onChange={(e) => update('recipientName', e.target.value)}
              className="input-field"
              placeholder="Nama lengkap penerima"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">No. Telepon</label>
            <input
              value={values.phoneNumber || ''}
              onChange={(e) => update('phoneNumber', e.target.value)}
              className="input-field"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Alamat</label>
        <AddressAutocomplete
          name="savedAddressLine"
          value={values.address || ''}
          onChange={(text) => update('address', text)}
          onSelect={(item) => {
            onChange({
              ...values,
              address: item.addressLine || item.label || values.address,
              city: item.city || values.city,
              province: item.province || values.province,
            });
          }}
          placeholder="Ketik nama jalan, kelurahan, atau landmark..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kota</label>
          <input
            value={values.city || ''}
            onChange={(e) => update('city', e.target.value)}
            className="input-field"
            placeholder="Semarang"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Provinsi</label>
          <input
            value={values.province || ''}
            onChange={(e) => update('province', e.target.value)}
            className="input-field"
            placeholder="Jawa Tengah"
          />
        </div>
      </div>

      {showDefaultToggle && (
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(values.isDefault)}
            onChange={(e) => update('isDefault', e.target.checked)}
            className="rounded border-gray-300"
          />
          Jadikan alamat utama
        </label>
      )}
    </div>
  );
}

export function emptyAddressForm(defaults = {}) {
  return {
    label: '',
    recipientName: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
    ...defaults,
  };
}

export function isAddressFormValid(values) {
  return Boolean(values.address?.trim() && values.city?.trim() && values.province?.trim());
}

export function formatAddressSummary(addr) {
  return `${addr.address}, ${addr.city}, ${addr.province}`;
}
