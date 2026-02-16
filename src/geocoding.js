/**
 * Meklē pilsētas informāciju, izmantojot pilsētas nosaukumu.
 * @async
 * @function searchCity
 * @param {string} cityName - Pilsētas nosaukums meklēšanai (piem., "Rīga").
 * @returns {Promise<Array<Object>>} Atgriež masīvu ar atrasto pilsētu objektiem. Ja nekas netiek atrasts, atgriež tukšu masīvu.
 * @property {number} results[].latitude - Pilsētas platuma grādi.
 * @property {number} results[].longitude - Pilsētas garuma grādi.
 * @property {string} results[].name - Pilsētas nosaukums.
 * @property {string} results[].country - Valsts nosaukums.
 * @throws {Error} Izmet kļūdu "TIMEOUT", ja pieprasījums pārsniedz 5 sekundes.
 * @throws {Error} Izmet kļūdu "NO_INTERNET", ja radušās problēmas ar tīkla savienojumu.
 * @throws {Error} Izmet kļūdu "API_ERROR:status", ja serveris atbild ar kļūdas kodu.
 */
async function searchCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API_ERROR:${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || []; // Atgriež tukšu masīvu, ja nekas nav atrasts
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    if (
      error.message.includes("fetch failed") ||
      error.code === "ENOTFOUND" ||
      error.code === "EAI_AGAIN" ||
      error.code === "ETIMEDOUT"
    ) {
      throw new Error("NO_INTERNET");
    }

    throw error;
  }
}

module.exports = { searchCity };
