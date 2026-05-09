const API_KEY = 'YOUR_API_KEY';

const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

// Поиск города по названию
export const searchCity = async (cityName) => {
  const response = await fetch(
    `${GEO_URL}?q=${cityName}&limit=5&appid=${API_KEY}&lang=ru`
  );
  const data = await response.json();
  return data;
};

// Получение прогноза погоды по координатам
export const getWeatherForecast = async (lat, lon) => {
  const response = await fetch(
    `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
  );
  const data = await response.json();
  return data;
};

export const getAirQuality = async (lat, lon) => {
  const response = await fetch(
    `${AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  const data = await response.json();
  return data;
};

export const getMockWeatherForecast = () => {
  return {
    city: { name: 'Москва', country: 'RU' },
    list: [
      {
        dt: Date.now() / 1000,
        main: { temp: 22, feels_like: 20, humidity: 65 },
        weather: [{ id: 800, main: 'Clear', description: 'ясно', icon: '01d' }],
        wind: { speed: 3.5 },
        dt_txt: new Date().toISOString()
      },
      {
        dt: (Date.now() + 86400000) / 1000,
        main: { temp: 20, feels_like: 18, humidity: 70 },
        weather: [{ id: 801, main: 'Clouds', description: 'малооблачно', icon: '02d' }],
        wind: { speed: 4.2 },
        dt_txt: new Date(Date.now() + 86400000).toISOString()
      },
      {
        dt: (Date.now() + 172800000) / 1000,
        main: { temp: 18, feels_like: 17, humidity: 75 },
        weather: [{ id: 500, main: 'Rain', description: 'небольшой дождь', icon: '10d' }],
        wind: { speed: 5.0 },
        dt_txt: new Date(Date.now() + 172800000).toISOString()
      }
    ]
  };
};

export const getMockAirQuality = () => {
  return {
    list: [{
      main: { aqi: 2 },
      components: { pm2_5: 12.5, pm10: 25.3, o3: 45, no2: 18 }
    }]
  };
};

export const USE_MOCK = false;