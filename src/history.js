/**
 * Aprēķina un attēlo laikapstākļu vēsturi un statistiku
 * @param {Array} history - Vēstures ierakstu masīvs no JSON faila
 * @param {string|null} cityName - Pilsētas nosaukums vai ID filtrēšanai
 * @param {number|null} days - Dienu skaits, par kurām rādīt vēsturi
 */
function displayHistory(history, cityName = null, days = null) {
  // Nodrošinām, ka pat ja parametrs pazūd, programma neizmet ReferenceError
  const filterDays = days ? parseInt(days) : null;

  if (!history || history.length === 0) {
    console.log("\n⚠ Vēsture ir tukša.");
    return;
  }

  // 1. Filtrējam pēc pilsētas (locationId)
  let filtered = cityName
    ? history.filter(
        (h) =>
          h.locationId && h.locationId.toLowerCase() === cityName.toLowerCase(),
      )
    : [...history];

  // 2. Filtrējam pēc datuma diapazona
  if (filterDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);

    filtered = filtered.filter((h) => new Date(h.fetchedAt) >= cutoffDate);
  }

  // 3. Kārtojam: No jaunākā uz vecāko
  filtered.sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt));

  if (filtered.length === 0) {
    console.log(`\n⚠ Dati netika atrasti ar norādītajiem filtriem.`);
    return;
  }

  // 4. Formatēta izvade
  console.log(
    `\n=== Laikapstākļu vēsture: ${cityName || "Visas pilsētas"} ===`,
  );
  if (filterDays) console.log(`(Pēdējās ${filterDays} dienas)`);

  const col = { date: 19, temp: 10, hum: 10, wind: 12 };
  const header =
    "Datums".padEnd(col.date) +
    "| " +
    "Temp.".padEnd(col.temp) +
    "| " +
    "Mitrums".padEnd(col.hum) +
    "| " +
    "Vējš".padEnd(col.wind) +
    "| " +
    "Apstākļi";

  console.log(header);
  console.log("-".repeat(header.length + 15));

  let temps = [];
  let humidities = [];

  filtered.forEach((entry) => {
    temps.push(entry.temperature);
    humidities.push(entry.humidity);

    const date = entry.fetchedAt.replace("T", " ").substring(0, 16);
    const row =
      `${date}`.padEnd(col.date) +
      "| " +
      `${entry.temperature.toFixed(1)}°C`.padEnd(col.temp) +
      "| " +
      `${entry.humidity}%`.padEnd(col.hum) +
      "| " +
      `${entry.windSpeed.toFixed(1)} km/h`.padEnd(col.wind) +
      "| " +
      entry.description;

    console.log(row);
  });

  // 5. Statistika
  const count = filtered.length;
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / count).toFixed(1);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);

  console.log(`\n── Statistika (${count} ieraksti) ──`);
  console.log(`Vidējā temperatūra:   ${avgTemp} °C`);
  console.log(`Min / Max:             ${minTemp} °C / ${maxTemp} °C`);
  console.log("─".repeat(30));
}

module.exports = { displayHistory };
