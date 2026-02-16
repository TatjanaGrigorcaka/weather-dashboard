const readline = require("readline");
const { searchCity } = require("./geocoding");
const { fetchWeather } = require("./api");
const {
  getWeatherDescription,
  addLocation,
  removeLocation,
} = require("./utils");
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
 * Palīgfunkcija centralizētai kļūdu ziņojumu izvadei
 */
async function handleError(error, appData) {
  if (error.message === "NO_INTERNET") {
    console.log("\n⚠ Neizdevās savienoties ar serveri.");
    console.log("Pārbaudi interneta savienojumu.");
    const showCache = await ask(
      "Vai vēlies apskatīt pēdējos kešotos datus? (j/n): ",
    );
    if (showCache.toLowerCase() === "j") {
      displayHistory(appData.weatherHistory, appData.locations);
    }
  } else if (error.message.startsWith("API_ERROR:")) {
    const status = error.message.split(":")[1];
    console.log(`\n⚠ API atgrieza kļūdu (statuss: ${status}).`);
    console.log("Mēģini vēlreiz pēc dažām minūtēm.");
  } else if (error.message === "TIMEOUT") {
    console.log("\n⚠ Serveris neatbildēja laicīgi (timeout).");
    console.log("Mēģini vēlreiz.");
  } else {
    console.log("\n⚠ Notika neparedzēta kļūda: " + error.message);
  }
}

/**
 * 1. Apskatīt laikapstākļus
 */
async function handleWeatherSearch(appData) {
  const cityName = await ask(
    "\nIevadi pilsētas nosaukumu (vai Enter, lai izvēlētos saglabātu): ",
  );
  let selectedLoc = null;

  try {
    if (cityName === "" && appData.locations.length > 0) {
      console.log("\nSaglabātās vietas:");
      appData.locations.forEach((l, i) => {
        console.log(`${i + 1}. ${l.name}, ${l.country}`);
      });
      const favChoice = await ask(`Izvēlies (1-${appData.locations.length}): `);
      selectedLoc = appData.locations[parseInt(favChoice) - 1];
    } else if (cityName !== "") {
      const results = await searchCity(cityName);

      if (results.length === 0) {
        console.log(`\n⚠ Pilsēta "${cityName}" nav atrasta.`);
        console.log("Pārliecinies, ka nosaukums ir pareizs.");
        return;
      }

      console.log("\nAtrasti rezultāti:");
      results.forEach((loc, i) => {
        console.log(`${i + 1}. ${loc.name}, ${loc.country}`);
      });

      const choice = await ask(`Izvēlies (1-${results.length}): `);
      selectedLoc = results[parseInt(choice) - 1];
    }
    // 2. Ja vieta izvēlēta, iegūstam laikapstākļus un rādām rāmīti
    if (selectedLoc) {
      const weatherData = await fetchWeather(
        selectedLoc.latitude,
        selectedLoc.longitude,
      );

      const description = getWeatherDescription(
        weatherData.current.weather_code,
      );

      // Izsaucam jauno rāmīša funkciju
      displayWeather(
        selectedLoc.name,
        selectedLoc.country,
        weatherData.current,
        description,
      );

      // Saglabājam vēsturē
      appData.weatherHistory.push({
        locationId: selectedLoc.id || selectedLoc.name,
        fetchedAt: new Date().toISOString(),
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
        description: description.description,
      });

      saveData(appData);
      console.log("✓ Dati saglabāti vēsturē.");
    }
  } catch (error) {
    await handleError(error, appData);
  }
}

/**
 * 3. Atrašanās vietu pārvaldība
 */
async function handleLocationManagement(appData) {
  let managing = true;

  while (managing) {
    console.log("\n=== Saglabātās atrašanās vietas ===");
    if (!appData.locations || appData.locations.length === 0) {
      console.log("Saraksts ir tukšs.");
    } else {
      appData.locations.forEach((loc, index) => {
        console.log(`${index + 1}. ${loc.name}, ${loc.country}`);
      });
    }

    console.log("\nOpcijas:");
    console.log("[a] Pievienot jaunu vietu");
    console.log("[b] Dzēst vietu");
    console.log("[c] Atpakaļ uz galveno izvēlni");

    const action = await ask("\nIzvēlies: ");

    try {
      if (action.toLowerCase() === "a") {
        const cityName = await ask("Ievadi pilsētu: ");
        if (!cityName) continue;

        const results = await searchCity(cityName);
        if (results.length === 0) {
          console.log(`\n⚠ Pilsēta "${cityName}" nav atrasta.`);
          console.log("Pārliecinies, ka nosaukums ir pareizs.");
        } else {
          results.forEach((r, i) =>
            console.log(`${i + 1}. ${r.name}, ${r.country}`),
          );
          const idx = await ask("Kuru pievienot? ");
          const selected = results[parseInt(idx) - 1];

          if (selected) {
            const newLoc = addLocation(appData, selected);
            if (newLoc) {
              saveData(appData);
              console.log("✓ Vieta pievienota.");
            }
          }
        }
      } else if (action.toLowerCase() === "b") {
        const idx = await ask("Ievadi numuru, kuru dzēst: ");
        if (removeLocation(appData, parseInt(idx) - 1)) {
          saveData(appData);
          console.log("✓ Vieta izdzēsta.");
        } else {
          console.log("⚠ Nepareizs numurs.");
        }
      } else if (action.toLowerCase() === "c") {
        managing = false;
      }
    } catch (error) {
      await handleError(error, appData);
    }
  }
}

/**
 * Galvenā programma
 */
async function mainMenu() {
  const appData = loadData();
  // Nodrošinām bāzes struktūru
  if (!appData.locations) appData.locations = [];
  if (!appData.weatherHistory) appData.weatherHistory = [];

  let running = true;
  while (running) {
    console.log("\n=== LAIKAPSTĀKĻU INFORMĀCIJAS PANELIS ===");
    console.log("1. Apskatīt pašreizējos laikapstākļus");
    console.log("2. Apskatīt laikapstākļu vēsturi");
    console.log("3. Pārvaldīt saglabātās atrašanās vietas");
    console.log("4. Iziet");

    const choice = await ask("\nIzvēlies opciju (1 - 4): ");

    switch (choice) {
      case "1":
        await handleWeatherSearch(appData);
        break;
      case "2": {
        const city = await ask("Pilsētas nosaukums (Enter visām): ");
        const daysStr = await ask("Dienu skaits (Enter visai vēsturei): ");
        const daysParam = daysStr ? parseInt(daysStr) : null;
        displayHistory(
          appData.weatherHistory,
          appData.locations,
          city || null,
          daysParam,
        );
        break;
      }
      case "3":
        await handleLocationManagement(appData);
        break;
      case "4":
        console.log("Paldies, ka izmantoji aplikāciju! Uz redzēšanos!");
        running = false;
        rl.close();
        break;
      default:
        console.log("⚠ Nepareiza izvēle.");
    }
  }
}

mainMenu();
