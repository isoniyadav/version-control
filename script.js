const cityInput=document.querySelector('.city-input');
const searchButton=document.querySelector('.search-btn');
const locationButton=document.querySelector('.location-btn');
const currentWeatherDiv=document.querySelector('.current-weather');
const weatherCardsDiv=document.querySelector('.weather-cards');


const API_KEY="0ac32219bd590ac331db19c958242d4c"; //API key for OpenweatherMap api

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index ===0){ //HTML for main weather cast
        return `<div class="details">
                <h2 class="text-2xl">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4 class="text-base mt-3 font-medium">Temperature:${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
                <h4 class="text-base mt-3 font-medium">wind:${weatherItem.wind.speed} M/S</h4>
                <h4 class="text-base mt-3 font-medium">Humidity:${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon text-center">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon class="max-w-32 -mt-2.5">
                    <h4 class="-mt-3 capitalize">${weatherItem.weather[0].description}</h4>
                </div>`;
    }else{ //HTML for the other five day forecast card
        return `<li class="card  bg-gray-500 rounded p-4 w-1/5 text-amber-100"">
                <h3 class="text-lg">(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon class="mt-5 mb-0 -mt-12 mx-0 max-w-20">
                <h4 class="text-base">Temp:${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
                <h4 class="text-base">wind:${weatherItem.wind.speed} M/S</h4>
                <h4 class="text-base">Humidity:${weatherItem.main.humidity}%</h4>
            </li>`;
    }
}

const getWeatherDetails=(cityName, lat, lon) => {
    const WEATHER_API_URL=`https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        //Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //clearing provious weather data
        cityInput.value ="";
        currentWeatherDiv.innerHTML ="";
        weatherCardsDiv.innerHTML = "";

       //Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index==0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!")
    });
}

const getCityCoordinates = () => {
    const cityName=cityInput.value.trim(); //Get user entered city name and remove extra spaces
    if(!cityName) return; //Return if cityName is empty
    const GEOCODING_API_URL=`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    //Get entered city coordinates(latitude,longitude, and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name, lat, lon}=data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!")
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; //Get coordinates of user location
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const {name}=data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city!!")
            });
        },
        error => { // Show alert if user denied the loaction permission
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied.Please reset location permission to grant access again.");
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());