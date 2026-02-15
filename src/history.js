/**
 * Aprēķina un attēlo laikapstākļu vēsturi un statistiku
 * @param {Array} history - Vēstures ierakstu masīvs (appData.weatherHistory)
 * @param {Array} locations - Saglabāto lokāciju masīvs (appData.locations)
 * @param {string|null} searchTerm - Pilsētas nosaukums vai ID filtrēšanai
 * @param {number|null} days - Dienu skaits
 */
function displayHistory(history, locations, searchTerm = null, days = null) {
  const safeHistory = Array.isArray(history) ? history : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  if (safeHistory.length === 0) {
    console.log("\n⚠ Vēsture ir tukša.");
    return;
  }

  // 1. Atrodam atbilstošos ID pēc nosaukuma
  let targetIds = [];
  if (searchTerm) {
    const termLower = searchTerm.toLowerCase();
    const matchedLocations = safeLocations.filter(
      (loc) => loc.name && loc.name.toLowerCase() === termLower,
    );
    targetIds = matchedLocations.map((loc) => loc.id.toLowerCase());
    targetIds.push(termLower);
  }

  // 2. Filtrējam vēsturi
  let filtered = searchTerm
    ? safeHistory.filter(
        (h) => h.locationId && targetIds.includes(h.locationId.toLowerCase()),
      )
    : [...safeHistory];

  // 3. Filtrējam pēc datuma
  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    filtered = filtered.filter((h) => new Date(h.fetchedAt) >= cutoffDate);
  }

  // 4. Kārtojam
  filtered.sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt));

  if (filtered.length === 0) {
    console.log(
      `\n⚠ Dati netika atrasti pilsētai "${searchTerm || "Visiem"}".`,
    );
    return;
  }

  // 5. Tabulas izvade
  console.log(
    `\n=== Laikapstākļu vēsture: ${searchTerm || "Visas pilsētas"} ===`,
  );
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
  let winds = []; // Pievienojam vēja masīvu statistikai

  filtered.forEach((entry) => {
    temps.push(entry.temperature);
    humidities.push(entry.humidity);
    winds.push(entry.windSpeed); // Saglabājam vēju

    const date = entry.fetchedAt.replace("T", " ").substring(0, 16);
    console.log(
      `${date}`.padEnd(col.date) +
        "| " +
        `${entry.temperature.toFixed(1)}°C`.padEnd(col.temp) +
        "| " +
        `${entry.humidity}%`.padEnd(col.hum) +
        "| " +
        `${entry.windSpeed.toFixed(1)} km/h`.padEnd(col.wind) +
        "| " +
        `${entry.description}`,
    );
  });

  // 6. Statistika (Aprēķini izmantojot jau aizpildītos masīvus)
  const count = filtered.length;
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / count).toFixed(1);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);
  const avgHum = (humidities.reduce((a, b) => a + b, 0) / count).toFixed(0);
  const avgWind = (winds.reduce((a, b) => a + b, 0) / count).toFixed(1);

  // 7. Uzlabota un izlīdzināta izvade
  console.log(`\n────────── Statistika (${count} ieraksti) ──────────`);

  const labelWidth = 22; // Fiksēts platums, lai visi skaitļi būtu vienā līmenī

  console.log(`${"🌡️ Vidējā temperatūra:".padEnd(labelWidth)} ${avgTemp} °C`);
  console.log(
    `${"📉 Min / Max:".padEnd(labelWidth)} ${minTemp} °C / ${maxTemp} °C`,
  );
  console.log(`${"💧 Vidējais mitrums:".padEnd(labelWidth)} ${avgHum} %`);
  console.log(`${"💨 Vidējais vējš:".padEnd(labelWidth)} ${avgWind} km/h`);

  console.log("──────────────────────────────────────────────────");
}

module.exports = { displayHistory };
