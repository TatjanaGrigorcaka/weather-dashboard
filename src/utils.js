/**
 * Pārvērš WMO weather code saprotamā tekstā un ikonā
 * @param {number} code - WMO weather code
 * @returns {{ description: string, icon: string }}
 */

function getWeatherDescription(code) {
  const weatherMap = {
    0: { description: "Skaidrs laiks", icon: "☀️" },
    1: { description: "Pārsvarā skaidrs", icon: "⛅" },
    2: { description: "Daļēji mākoņains", icon: "⛅" },
    3: { description: "Apmācies", icon: "☁️" },
    45: { description: "Migla", icon: "🌫️" },
    51: { description: "Viegla smidzināšana", icon: "🌧️" },
    61: { description: "Viegls lietus", icon: "🌧️" },
    63: { description: "Mērens lietus", icon: "🌧️" },
    65: { description: "Stiprs lietus", icon: "🌧️" },
    71: { description: "Viegls sniegs", icon: "❄️" },
    80: { description: "Lietusgāzes", icon: "🌦️" },
    95: { description: "Pērkona negaiss", icon: "⛈️" },
  };

  return weatherMap[code] || { description: "Nezināmi apstākļi", icon: "❓" };
}

/**
 * Pievieno jaunu lokāciju lietotnes datiem, ja tāda jau neeksistē.
 * Veic pārbaudi pēc koordinātām (latitude un longitude), lai izvairītos no dublikātiem.
 * @param {Object} appData - Galvenais lietotnes datu objekts.
 * @param {Array} appData.locations - Masīvs ar saglabātajām lokācijām.
 * @param {Object} selectedFromApi - Pilsētas dati no ģeokodēšanas API rezultātiem.
 * @param {string} selectedFromApi.name - Pilsētas nosaukums.
 * @param {string} selectedFromApi.country - Valsts nosaukums.
 * @param {number} selectedFromApi.latitude - Platuma grādi.
 * @param {number} selectedFromApi.longitude - Garuma grādi.
 * @returns {Object|null} Atgriež izveidoto lokācijas objektu vai null, ja pilsēta jau eksistē.
 */
function addLocation(appData, selectedFromApi) {
  // Pārbaudām, vai pilsēta ar šādām koordinātām jau ir sarakstā
  const isDuplicate = appData.locations.some(
    (loc) =>
      loc.latitude === selectedFromApi.latitude &&
      loc.longitude === selectedFromApi.longitude,
  );

  if (isDuplicate) {
    console.log(
      `\n⚠ Pilsēta "${selectedFromApi.name}" jau ir pievienota saglabātajām vietām.`,
    );
    return null;
  }

  // Ja nav dublikāts, veidojam jaunu objektu pēc prasītās struktūras
  const newLocation = {
    id: "loc_" + Date.now(),
    name: selectedFromApi.name,
    country: selectedFromApi.country,
    latitude: selectedFromApi.latitude,
    longitude: selectedFromApi.longitude,
    addedAt: new Date().toISOString(),
  };

  appData.locations.push(newLocation);
  return newLocation;
}

/**
 * Izdzēš lokāciju no saraksta pēc norādītā indeksa.
 * @param {Object} appData - Galvenais lietotnes datu objekts.
 * @param {Array} appData.locations - Lokāciju masīvs.
 * @param {number} index - Masīva indekss (0-based), kuru vēlas dzēst.
 * @returns {boolean} Atgriež true, ja dzēšana bija veiksmīga, pretējā gadījumā false.
 */
function removeLocation(appData, index) {
  if (index >= 0 && index < appData.locations.length) {
    appData.locations.splice(index, 1);
    return true;
  }
  return false;
}

module.exports = { getWeatherDescription, addLocation, removeLocation };
