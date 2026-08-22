const CITY_COORDS = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  vasai: { lat: 19.3919, lng: 72.8397 },
  virar: { lat: 19.4559, lng: 72.8115 },
  palghar: { lat: 19.6967, lng: 72.7654 },
  thane: { lat: 19.2183, lng: 72.9781 },
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function getCoordsFromLocation(location) {
  if (!location) return CITY_COORDS.mumbai;
  const lower = location.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return CITY_COORDS.mumbai;
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDistanceKm(entityA, entityB) {
  const lat1 = entityA.latitude ?? getCoordsFromLocation(entityA.location).lat;
  const lng1 = entityA.longitude ?? getCoordsFromLocation(entityA.location).lng;
  const lat2 = entityB.latitude ?? getCoordsFromLocation(entityB.location).lat;
  const lng2 = entityB.longitude ?? getCoordsFromLocation(entityB.location).lng;
  return Math.round(haversineDistance(lat1, lng1, lat2, lng2) * 10) / 10;
}
