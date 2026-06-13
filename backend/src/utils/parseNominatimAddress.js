function buildAddressLine(address, displayName) {
  if (!address) {
    return displayName?.split(',')[0]?.trim() || '';
  }

  const parts = [];
  if (address.road) parts.push(address.road);
  if (address.house_number) parts.push(address.house_number);
  if (parts.length > 0) return parts.join(' ');

  if (address.pedestrian) return address.pedestrian;
  if (address.neighbourhood) return address.neighbourhood;
  if (address.suburb) return address.suburb;

  return displayName?.split(',')[0]?.trim() || '';
}

function pickCity(address) {
  if (!address) return '';
  return (
    address.city
    || address.town
    || address.municipality
    || address.county
    || address.village
    || ''
  );
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
