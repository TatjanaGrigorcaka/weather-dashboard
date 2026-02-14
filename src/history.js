/**
 * Aprēķina un attēlo laikapstākļu vēsturi un statistiku
 * @param {Array} history - Vēstures ierakstu masīvs no JSON faila
 * @param {string|null} cityName - Pilsētas nosaukums filtrēšanai
 */
function displayHistory(history, cityName = null) {
  // 1. Filtrējam datus
  const filtered = cityName
    ? history.filter(
        (h) => h.locationId.toLowerCase() === cityName.toLowerCase(),
      )
    : history;

  if (filtered.length === 0) {
    console.log(
      `\n⚠ Vēstures dati pilsētai "${cityName || "Visas pilsētas"}" nav atrasti.`,
    );
    return;
  }

  // 2. Tabulas galvene un formatēšana
  console.log(
    `\n=== Laikapstākļu vēsture: ${cityName || "Visas pilsētas"} ===`,
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

  // 3. Datu izvadīšana un akumulēšana statistikai
  let temps = [];
  let humidities = [];

  filtered.forEach((entry) => {
    // Pievienojam vērtības masīviem statistikai
    temps.push(entry.temperature);
    humidities.push(entry.humidity);
    // Formatējam datumu uz YYYY-MM-DD HH:mm
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

  // 4. Statistikas aprēķini
  const count = filtered.length;
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / count).toFixed(1);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);
  const avgHum = (humidities.reduce((a, b) => a + b, 0) / count).toFixed(0);

  // 5. Statistikas izvade
  console.log(`\n── Statistika (${count} ieraksti) ──`);
  console.log(`Vidējā temperatūra:   ${avgTemp} °C`);
  console.log(`Min / Max:            ${minTemp} °C / ${maxTemp} °C`);
  console.log(`Vidējais mitrums:     ${avgHum} %`);
  console.log("─".repeat(30));
}

module.exports = { displayHistory };
