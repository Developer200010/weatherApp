const API_KEY = "b5610219b4adb8c54d0892c5557c0e9e";

// const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
// taking city input form user
document.getElementById("searchBtn").addEventListener("click", ()=>{
    const city = document.getElementById("cityInput").value.trim();
    if(city){
        fetchWeatherByCity(city);
    } else {
        alert("Please enter a valid city name")
    }
})

//here getting coordinates form browser
document.getElementById('currentBtn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    }, () => {
      alert('Unable to retrieve your location');
    });
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

//fetching data from api call for specific city

function fetchWeatherByCity(city){

  //fetching data form the local storage for recent searches
  const cachedKey = `weather_${city.toLowerCase()}`;
  const cachedData = localStorage.getItem(cachedKey);

  if(cachedData){
    const data = JSON.parse(cachedData);
    displayCurrentWeathers(data);
    fetchForeCastIfNeeded(city);
    fetchForeCast(city);
    return;
  }


    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => {
        if(!res.ok) throw new Error("city not found");
        return res.json();
    }).then(data =>{
        displayCurrentWeathers(data);
        saveRecentSearch(city);
        fetchForeCast(city);
    }).catch(err => alert(err.message));
}

//fetching weather data according to coordinates
function fetchWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      displayCurrentWeathers(data);
      
      const city = data.name;

      // 1️⃣ Update input value
      document.getElementById('cityInput').value = city;

      // 2️⃣ Update recent searches
      let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];

      const index = searches.indexOf(city);
      if (index > -1) {
        searches.splice(index, 1);  // Remove if already exists
      }
      searches.unshift(city);       // Add to top

      localStorage.setItem('recentSearches', JSON.stringify(searches));

      // 3️⃣ Update dropdown
      updateDropdown(searches);

      // 4️⃣ Optionally, fetch extended forecast
      fetchForeCast(city);
    })
    .catch(err => alert('Error fetching location weather'));
}


function fetchForeCast(city) {
    const cacheKey = `forecast_${city.toLowerCase()}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const data = JSON.parse(cachedData);
    displayForecast(data);
    return;
  }

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => displayForecast(data))
    .catch(err => console.error('Forecast fetch error:', err));
}

function fetchForeCastIfNeeded(city) {
  // This ensures forecast always updates even when weather is cached
  fetchForeCast(city);
}


function displayCurrentWeathers(data) {
  document.getElementById('weatherDisplay').innerHTML = `
  <div class="bg-white bg-opacity-20 backdrop-blur rounded-xl shadow-2xl p-6 border border-white border-opacity-30 transform transition hover:scale-105">
    <h2 class="text-2xl font-bold mb-2">${data.name}</h2>
    <p class="text-lg capitalize mb-2">${data.weather[0].description} 🌤️</p>
    <p class="text-lg">🌡️ Temp: <span class="font-semibold">${data.main.temp}°C</span></p>
    <p class="text-lg">💧 Humidity: ${data.main.humidity}%</p>
    <p class="text-lg">🌬️ Wind: ${data.wind.speed} m/s</p>
  </div>
`;
}

function displayForecast(data){
   const foreCastDisplay = document.getElementById("forecastDisplay");
foreCastDisplay.innerHTML = '';

const daily = data.list.filter(item => item.dt_txt.includes('12:00:00'));
daily.forEach(day => {
  foreCastDisplay.innerHTML += `
    <div class="bg-white bg-opacity-20 cardAnimate backdrop-blur rounded-xl shadow-lg p-4 border border-white border-opacity-30 text-center transform transition hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
      <p class="font-bold text-lg">${new Date(day.dt_txt).toDateString()}</p>
      <p class="capitalize">${day.weather[0].description}</p>
      <p>🌡️ ${day.main.temp}°C</p>
      <p>💧 ${day.main.humidity}%</p>
      <p>🌬️ ${day.wind.speed} m/s</p>
    </div>
  `;
})};



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
    // Build options
    dropdown.innerHTML = searches
      .map(city => `<option>${city}</option>`)
      .join('');
      
    dropdown.classList.remove('hidden');

    dropdown.onchange = () => {
      const selectedCity = dropdown.value;

      // 1️⃣ Clear and set input value
      input.value = selectedCity;

      // 2️⃣ Move selected to top of dropdown
      const index = searches.indexOf(selectedCity);
      if (index > -1) {
        searches.splice(index, 1);         // Remove from current position
        searches.unshift(selectedCity);    // Add to top
      }

      // 3️⃣ Save updated searches
      localStorage.setItem('recentSearches', JSON.stringify(searches));

      // 4️⃣ Rebuild dropdown with new order
      updateDropdown(searches);

      // 5️⃣ Fetch weather
      fetchWeatherByCity(selectedCity);
    };

  } else {
    dropdown.classList.add('hidden');
  }
}


// Load recent searches on page load
const localStorageCity = updateDropdown(JSON.parse(localStorage.getItem('recentSearches')) || []);
