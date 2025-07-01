const API_KEY = "b5610219b4adb8c54d0892c5557c0e9e";

const weatherDisplay = document.getElementById("weatherDisplay");
const forecastDisplay = document.getElementById("forecastDisplay");
const forecastEWText  = document.getElementById("forecasted-weather-text");
// 🌤 Initial placeholder
weatherDisplay.innerHTML = `<div class="text-center text-lg font-semibold text-gray-500">🌤 Ready to serve your forecast!</div>`;

// Search button
document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  if (city) {
    showLoading();
    forecastEWText.textContent = "forecasted weather"
    fetchWeatherByCity(city);

  } else {
    alert("Please enter a valid city name");
  }
});

// Current location button
document.getElementById('currentBtn').addEventListener('click', () => {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoord(pos.coords.latitude, pos.coords.longitude);
    }, () => {
      alert('Unable to retrieve your location');
    });
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

function showLoading() {
  weatherDisplay.innerHTML = `<div class="loading-text">⏳ Loading weather data...</div>`;
  forecastDisplay.innerHTML = "";
}

// fetching city data
function fetchWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      displayCurrentWeathers(data);
      saveRecentSearch(city);
      fetchForeCast(city);
    })
    .catch(err => alert(err.message));
}

function fetchWeatherByCoord(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
    forecastEWText.textContent = "forecasted weather"
      displayCurrentWeathers(data);

      const city = data.name;
      document.getElementById('cityInput').value = city;

      let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
      const index = searches.indexOf(city);
      if (index > -1) {
        searches.splice(index, 1);
      }
      searches.unshift(city);
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      updateDropdown(searches);

      fetchForeCast(city);
    })
    .catch(err => alert('Error fetching location weather'));
}

function fetchForeCast(city) {
  const line = document.getElementById("line");
  line.classList.add("line")
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => displayForecast(data))
    .catch(err => console.error('Forecast fetch error:', err));
}

function displayCurrentWeathers(data) {
  weatherDisplay.innerHTML = `
    <div id="weatherCard" class="card">
     <h3 class="h3-title" id="current-weather-text text-bold"> Current Weather </h3>
     <hr>
      <h2 class="text-2xl font-bold mb-2">${data.name}</h2>
      <p class="text-lg capitalize mb-2">${data.weather[0].description} 🌤️</p>
      <p class="text-lg">🌡️ Temp: <span class="font-semibold">${data.main.temp}°C</span></p>
      <p class="text-lg">💧 Humidity: ${data.main.humidity}%</p>
      <p class="text-lg">🌬️ Wind: ${data.wind.speed} m/s</p>
    </div>
  `;

}


function displayForecast(data) {
  console.log(data, " inside of displayForecast")
  forecastDisplay.innerHTML = '';
  const daily = data.list.filter(item => item.dt_txt.includes('12:00:00'));
  daily.forEach(day => {
    forecastDisplay.innerHTML += `
      <div class="card hover:scale-110 hover:transition duration-500">

        <p class="font-bold text-lg">${new Date(day.dt_txt).toDateString()}</p>
        <p class="capitalize">${day.weather[0].description}</p>
        <p>🌡️ ${day.main.temp}°C</p>
        <p>💧 ${day.main.humidity}%</p>
        <p>🌬️ ${day.wind.speed} m/s</p>
      </div>
    `;
  });
}

function saveRecentSearch(city) {
  let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  if (!searches.includes(city)) {
    searches.unshift(city);
    if (searches.length > 5) searches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  }
  updateDropdown(searches);
}

function updateDropdown(searches) {
  const dropdown = document.getElementById('recentDropdown');
  const input = document.getElementById('cityInput');

  if (searches.length > 0) {
    dropdown.innerHTML = searches
      .map(city => `<option class="text-black">${city}</option>`)
      .join('');
    dropdown.classList.remove('hidden');

    dropdown.onchange = () => {
      const selectedCity = dropdown.value;
      input.value = selectedCity;
      const index = searches.indexOf(selectedCity);
      if (index > -1) {
        searches.splice(index, 1);
        searches.unshift(selectedCity);
      }
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      updateDropdown(searches);
      showLoading();
      fetchWeatherByCity(selectedCity);
    };
  } else {
    dropdown.classList.add('hidden');
  }
}

// Load recent searches on page load
updateDropdown(JSON.parse(localStorage.getItem('recentSearches')) || []);

// Theme toggle logic (unchanged)
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.classList.add(savedTheme);
  updateButtonText(savedTheme);
} else {
  body.classList.add("light-mode");
  updateButtonText("light-mode");
}

// toggle theme logi
toggleBtn.addEventListener("click", () => {
  if (body.classList.contains("light-mode")) {
    body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark-mode");
    updateButtonText("dark-mode");
  } else {
    body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light-mode");
    updateButtonText("light-mode");
  }
});
function updateButtonText(theme) {
  toggleBtn.textContent = theme === "dark-mode" ? "☀️ Light Mode" : "🌙 Dark Mode";
}
