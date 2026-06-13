import SavedAddressForm, { formatAddressSummary } from '../profile/SavedAddressForm';

export default function SavedAddressPicker({
  addresses,
  selectedId,
  onSelectSaved,
  onSelectNew,
  newAddressValues,
  onNewAddressChange,
}) {
  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                selectedId === addr.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="savedAddress"
                checked={selectedId === addr.id}
                onChange={() => onSelectSaved(addr)}
                className="mt-1"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-heading">{addr.label || 'Alamat'}</p>
                  {addr.isDefault && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Utama
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-1">{formatAddressSummary(addr)}</p>
              </div>
            </label>
          ))}

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
              selectedId === 'new'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
            }`}
          >
            <input
              type="radio"
              name="savedAddress"
              checked={selectedId === 'new'}
              onChange={onSelectNew}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-heading">Alamat baru</p>
              <p className="text-sm text-subtle">Isi alamat pengiriman lain</p>
            </div>
          </label>
        </div>
      )}

      {(selectedId === 'new' || addresses.length === 0) && (
        <SavedAddressForm
          values={newAddressValues}
          onChange={onNewAddressChange}
          showLabel={false}
        />
      )}
    </div>
  );
}
