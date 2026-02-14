const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/weather-data.json");

/**
 * Ielādē datus no JSON faila. Ja fails neeksistē vai ir bojāts,
 * atgriež tukšu sākuma struktūru.
 * @returns {Object} Objekts ar lokācijām un laikapstākļu vēsturi.
 */
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { locations: [], weatherHistory: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw || '{"locations": [], "weatherHistory": []}');
  } catch (error) {
    return { locations: [], weatherHistory: [] };
  }
}

/**
 * Saglabā lietojumprogrammas datus JSON failā.
 * Automātiski izveido datu mapi, ja tāda neeksistē.
 * @param {Object} data - Saglabājamais datu objekts .
 */
function saveData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadData, saveData };
