const { searchCity } = require("./geocoding");
const { fetchWeather } = require("./api");

async function testApi() {
  console.log("--- API Testēšanas rīks ---");
  const cityInput = "Riga";

  try {
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

    console.log("2. Iegūstam laikapstākļu datus...");
    const weather = await fetchWeather(city.latitude, city.longitude);
    // console.log("weather", weather);

    console.log("✅ Dati saņemti!");
    console.log(
      "Pašreizējā temperatūra:",
      weather.current.temperature_2m,
      "°C",
    );
    console.log("Vēja ātrums:", weather.current.wind_speed_10m, "km/h");
    console.log("Laikapstākļu kods:", weather.current.weather_code);
  } catch (error) {
    console.error("❌ Testa laikā radās kļūda:", error.message);
  }
}

testApi();
