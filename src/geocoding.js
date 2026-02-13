/**
 * Meklē pilsētu pēc nosaukuma, atgriež koordinātas
 * @param {string} cityName - Pilsētas nosaukums
 * @returns {Promise<Array>} Atrasto vietu masīvs
 */
async function searchCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en`;

  try {
    const response = await fetch(url);
    // console.log("response", response);

    if (!response.ok) throw new Error("Ģeokodēšanas API kļūda");

    const data = await response.json();
    // console.log("data", data);

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((r) => ({
      name: r.name,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (error) {
    console.error("Kļūda meklējot pilsētu:", error.message);
    return [];
  }
}

module.exports = { searchCity };
