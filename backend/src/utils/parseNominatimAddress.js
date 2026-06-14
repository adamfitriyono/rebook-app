function buildAddressLine(address, displayName) {
  if (!address) {
    return displayName?.split(',')[0]?.trim() || '';
  }

  const parts = [];
  if (address.road) parts.push(address.road);
  if (address.house_number) parts.push(`No. ${address.house_number}`);
  if (parts.length > 0) {
    const line = parts.join(' ');
    if (address.suburb && !line.includes(address.suburb)) {
      return `${line}, ${address.suburb}`;
    }
    return line;
  }

  if (address.pedestrian) return address.pedestrian;
  if (address.neighbourhood) return address.neighbourhood;
  if (address.suburb) return address.suburb;
  if (address.village) return address.village;

  return displayName?.split(',')[0]?.trim() || '';
}

function normalizeCityName(value) {
  if (!value) return '';
  return value
    .replace(/^Kota\s+/i, '')
    .replace(/^Kabupaten\s+/i, '')
    .replace(/^Kab\.\s+/i, '')
    .trim();
}

function pickCity(address) {
  if (!address) return '';

  // Nominatim di Indonesia sering pakai county/state_district untuk kota/kabupaten,
  // bukan field "city" standar.
  const candidates = [
    address.city,
    address.town,
    address.municipality,
    address.county,
    address.state_district,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCityName(candidate);
    if (normalized) return normalized;
  }

  return '';
}

function formatNominatimResults(results) {
  return results.map((item) => {
    const address = item.address || {};
    return {
      id: String(item.place_id),
      label: item.display_name,
      addressLine: buildAddressLine(address, item.display_name),
      city: pickCity(address),
      province: address.state || '',
    };
  });
}

module.exports = {
  buildAddressLine,
  pickCity,
  formatNominatimResults,
};
