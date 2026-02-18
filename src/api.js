/**
 * Iegūst pašreizējos laikapstākļu datus no Open-Meteo API.
 * @async
 * @function fetchWeather
 * @param {number} latitude - Vietas platuma grādi (piem., 56.946).
 * @param {number} longitude - Vietas garuma grādi (piem., 24.105).
 * @returns {Promise<Object>} Atgriež objektu ar laikapstākļu datiem (temperatūra, mitrums u.c.).
 * @throws {Error} Izmet kļūdu "TIMEOUT", ja pieprasījums pārsniedz 5 sekundes.
 * @throws {Error} Izmet kļūdu "NO_INTERNET", ja nav tīkla savienojuma.
 * @throws {Error} Izmet kļūdu "API_ERROR:status", ja serveris atbild ar kļūdas kodu.
 */
async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API_ERROR:${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    // Pārbaudām visus iespējamos interneta zuduma signālus
    if (
      error.message.includes("fetch failed") ||
      error.code === "ENOTFOUND" ||
      error.code === "EAI_AGAIN" ||
      error.code === "ECONNREFUSED"
    ) {
      throw new Error("NO_INTERNET");
    }

    throw error;
  }
}

module.exports = { fetchWeather };
