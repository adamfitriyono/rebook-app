const { formatNominatimResults } = require('./parseNominatimAddress');

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'ReBook/1.0 (contact: hello@rebook.id)';

async function searchAddresses(query) {
  const url = new URL(`${NOMINATIM_BASE_URL}/search`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'id');
  url.searchParams.set('limit', '5');
  url.searchParams.set('q', query);

  const response = await fetch(url, {
    headers: {
      'User-Agent': NOMINATIM_USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return formatNominatimResults(data);
}

module.exports = {
  searchAddresses,
};
