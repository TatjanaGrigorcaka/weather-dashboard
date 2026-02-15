const readline = require("readline");
const { searchCity } = require("./geocoding");
const { fetchWeather } = require("./api");
const { getWeatherDescription } = require("./utils");
const { displayWeather } = require("./display");
const { loadData, saveData } = require("./storage");
const { displayHistory } = require("./history");

// Izveidojam interfeisu saziņai ar lietotāju
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Palīgfunkcija jautājumu uzdošanai
 */
function ask(question) {
  return new Promise((resolve) =>
    rl.question(question, (ans) => resolve(ans.trim())),
  );
}

/**
 * Galvenā laikapstākļu iegūšanas loģika
 */
async function handleWeatherSearch(appData) {
  const cityName = await ask("\nIevadi pilsētas nosaukumu: ");
  if (!cityName) return;

  try {
    //  Meklējam pilsētu (geocoding)
    const locations = await searchCity(cityName);
    if (locations.length === 0) {
      console.log("⚠ Pilsēta netika atrasta.");
      return;
    }

    console.log("\nAtrastie rezultāti:");
    locations.forEach((loc, index) => {
      console.log(
        `${index + 1}. ${loc.name}, ${loc.country} (${loc.latitude}, ${loc.longitude})`,
      );
    });
    // Izvēlamies pilsétu
    const choice = await ask(
      `Izvēlies (1-${locations.length}) vai 'q' lai atceltu: `,
    );
    if (choice.toLowerCase() === "q") return;

    const selectedLoc = locations[parseInt(choice) - 1];
    if (!selectedLoc) {
      console.log("⚠ Nepareiza izvēle.");
      return;
    }
    // Iegūstam laikapstākļu datus (api)
    console.log("Iegūstam datus...");
    const weatherData = await fetchWeather(
      selectedLoc.latitude,
      selectedLoc.longitude,
    );
    // Apstrādājam weather_code (utils)
    const description = getWeatherDescription(weatherData.current.weather_code);

    // Attēlojam rezultātu (display)
    displayWeather(
      selectedLoc.name,
      selectedLoc.country,
      weatherData.current,
      description,
    );

    // Sagatavojam ierakstu vēsturei (storage)
    appData.weatherHistory.push({
      locationId: selectedLoc.name, // Pagaidām izmantojam vārdu kā ID
      fetchedAt: weatherData.current.time,
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
      weatherCode: weatherData.current.weather_code,
      description: description.description,
    });
    // Saglabājam atjaunoto objektu
    saveData(appData);
    console.log("✓ Dati saglabāti vēsturē.");
  } catch (error) {
    console.error("❌ Kļūda:", error.message);
  }
}

/**
 * Programmas galvenā cilpa
 */
async function mainMenu() {
  let running = true;
  // Ielādējam esošos datus (lai nepazaudētu vēsturi)
  const appData = loadData();

  while (running) {
    console.log("\n=== Laikapstākļu informācijas panelis ===");
    console.log("1. Apskatīt pašreizējos laikapstākļus");
    console.log("2. Apskatīt laikapstākļu vēsturi");
    console.log("3. Iziet");

    const choice = await ask("Izvēlies opciju (1-3): ");

    switch (choice) {
      case "1":
        await handleWeatherSearch(appData);
        break;
      case "2": {
        // Izmanto figūriekavas, lai izolētu mainīgos switch blokā
        const histCity = await ask("Ievadi pilsētu (Enter visām): ");
        const daysStr = await ask(
          "Par cik dienām rādīt? (Enter visai vēsturei): ",
        );

        // Konvertējam uz skaitli vai null
        const daysParam = daysStr ? parseInt(daysStr) : null;

        // Izsaucam funkciju ar 3 parametriem
        displayHistory(appData.weatherHistory, histCity || null, daysParam);
        break;
      }
      case "3":
        console.log("Uz redzēšanos!");
        running = false;
        rl.close();
        break;
      default:
        console.log("Nepareiza izvēle, mēģini vēlreiz.");
    }
  }
}

mainMenu();
