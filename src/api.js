/**
 * Iegūst pašreizējos laikapstākļus no Open-Meteo API
 * @param {number} latitude - Platuma grāds
 * @param {number} longitude - Garuma grāds
 * @returns {Promise<Object>} Laikapstākļu dati
 */

async function fetchWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,` +
    `wind_speed_10m,weather_code` +
    `&timezone=auto`;

  try {
    const response = await fetch(url);
    // console.log("response", response);
    if (!response.ok) {
      throw new Error(`API kļūda: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("data", data);
    return data;
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
      throw new Error("Nav interneta savienojuma");
    }
    throw error;
  }
}

module.exports = { fetchWeather };
