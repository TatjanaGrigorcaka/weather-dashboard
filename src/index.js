const { searchCity } = require("./geocoding");
const { fetchWeather } = require("./api");
const { getWeatherDescription } = require("./utils");
const { displayWeather } = require("./display");
const { loadData, saveData } = require("./storage");

async function testFullIntegration() {
  console.log("--- Pilna cikla testēšana ---");
  const cityInput = "Riga";

  try {
    // 1. Ielādējam esošos datus (lai nepazaudētu vēsturi)
    const appData = loadData();

    // 2. Meklējam pilsētu
    console.log(`1. Meklējam pilsētu: ${cityInput}...`);
    const locations = await searchCity(cityInput);

    if (locations.length === 0) {
      console.log("Pilsēta netika atrasta.");
      return;
    }

    // Izvēlamies pirmo rezultātu (MVP tests)
    const city = locations[0];
    // console.log("city", city);
    console.log(
      `✅ Atrasts: ${city.name}, ${city.country} (${city.latitude}, ${city.longitude})`,
    );
    // 3. Iegūstam laikapstākļu datus
    console.log("2. Iegūstam laikapstākļu datus...");
    const weatherData = await fetchWeather(city.latitude, city.longitude);
    const current = weatherData.current;
    // console.log("current", current);

    // 4. Apstrādājam weather_code (utils)
    const description = getWeatherDescription(current.weather_code);

    // 5. Attēlojam rezultātu (display)
    console.log("✅ Dati saņemti!");
    displayWeather(city.name, city.country, current, description);

    // 6. Sagatavojam ierakstu vēsturei (storage)
    const newHistoryEntry = {
      locationId: city.name, // Pagaidām izmantojam vārdu kā ID
      fetchedAt: new Date().toISOString(),
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      description: description.description,
    };

    appData.weatherHistory.push(newHistoryEntry);

    // Saglabājam atjaunoto objektu
    saveData(appData);
    console.log("✓ Dati veiksmīgi saglabāti JSON failā.");
  } catch (error) {
    console.error("❌ Kļūda testēšanas laikā:", error.message);
  }
}

testFullIntegration();
