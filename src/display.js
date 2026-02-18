/**
 * Attēlo laikapstākļu informāciju konsolē formatētā ASCII rāmītī.
 * @param {string} city - Pilsētas nosaukums.
 * @param {string} country - Valsts nosaukums.
 * @param {Object} data - API atgrieztie pašreizējie laikapstākļu dati.
 * @param {Object} desc - Objekts ar aprakstu un ikonu (no utils.js).
 */
function displayWeather(city, country, data, desc) {
  const { temperature_2m, relative_humidity_2m, wind_speed_10m, time } = data;

  // Formatējam datumu uz YYYY-MM-DD HH:mm
  const date = time.replace("T", " ").substring(0, 16);

  const width = 42; // Iekšējais platums

  // Funkcija standarta rindām
  const formatLine = (content) => `║ ${content.padEnd(width)} ║`;

  // Speciāla funkcija pirmajai rindai ar ikonu, lai kompensētu emodži platumu
  const formatHeaderLine = (icon, text) => {
    const fullText = `${icon}  ${text}`;
    // Emodži parasti aizņem 2 simbolu vietas, tāpēc atņemam 1 papildus atstarpi
    const paddingNeeded = width - (text.length + 3);
    return `║ ${fullText}${" ".repeat(paddingNeeded)} ║`;
  };

  console.log(`╔${"═".repeat(width + 2)}╗`);
  console.log(formatHeaderLine(desc.icon, `Laikapstākļi: ${city}, ${country}`));
  console.log(formatLine(`   ${date}`));
  console.log(`╠${"═".repeat(width + 2)}╣`);
  console.log(formatLine(`  Temperatūra:   ${temperature_2m} °C`));
  console.log(formatLine(`  Mitrums:       ${relative_humidity_2m} %`));
  console.log(formatLine(`  Vējš:          ${wind_speed_10m} km/h`));
  console.log(formatLine(`  Apstākļi:      ${desc.description}`));
  console.log(`╚${"═".repeat(width + 2)}╝`);
}

module.exports = { displayWeather };
