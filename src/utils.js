/**
 * Pārvērš WMO weather code saprotamā tekstā un ikonā
 * @param {number} code - WMO weather code
 * @returns {{ description: string, icon: string }}
 */

function getWeatherDescription(code) {
  const weatherMap = {
    0: { description: "Skaidrs laiks", icon: "☀️" },
    1: { description: "Pārsvarā skaidrs", icon: "⛅" },
    2: { description: "Daļēji mākoņains", icon: "⛅" },
    3: { description: "Apmācies", icon: "☁️" },
    45: { description: "Migla", icon: "🌫️" },
    51: { description: "Viegla smidzināšana", icon: "🌧️" },
    61: { description: "Viegls lietus", icon: "🌧️" },
    63: { description: "Mērens lietus", icon: "🌧️" },
    65: { description: "Stiprs lietus", icon: "🌧️" },
    71: { description: "Viegls sniegs", icon: "❄️" },
    80: { description: "Lietusgāzes", icon: "🌦️" },
    95: { description: "Pērkona negaiss", icon: "⛈️" },
  };

  return weatherMap[code] || { description: "Nezināmi apstākļi", icon: "❓" };
}

module.exports = { getWeatherDescription };
