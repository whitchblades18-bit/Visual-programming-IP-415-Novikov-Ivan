import { useState, useEffect, useCallback } from 'react';
import { 
  searchCity, 
  getWeatherForecast, 
  getAirQuality,
  getMockWeatherForecast,
  getMockAirQuality,
  USE_MOCK 
} from '../services/weather_service';

export const useWeather = () => {
  const [city, setCity] = useState('Москва');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Загрузка данных о погоде
  const fetchWeather = useCallback(async (lat, lon, cityName) => {
    try {
      let forecast, air;
      
      if (USE_MOCK) {
        forecast = getMockWeatherForecast();
        air = getMockAirQuality();
        forecast.city.name = cityName;
      } else {
        forecast = await getWeatherForecast(lat, lon);
        air = await getAirQuality(lat, lon);
      }
      
      setWeatherData(forecast);
      setAirQuality(air);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные о погоде');
      console.error(err);
    }
  }, []);

  // Поиск города
  const searchCityHandler = useCallback(async (query) => {
    if (!query.trim()) {
      setCitySuggestions([]);
      return;
    }

    try {
      let results;
      if (USE_MOCK) {
        results = [{ name: 'Москва', country: 'RU', lat: 55.75, lon: 37.62 }];
      } else {
        results = await searchCity(query);
      }
      setCitySuggestions(results);
    } catch (err) {
      console.error('Ошибка поиска города:', err);
      setCitySuggestions([]);
    }
  }, []);

  // Выбор города
  const selectCity = useCallback(async (selectedCity) => {
    setCity(selectedCity.name);
    setCitySuggestions([]);
    setLoading(true);
    
    await fetchWeather(selectedCity.lat, selectedCity.lon, selectedCity.name);
    
    setLoading(false);
  }, [fetchWeather]);

  // Загрузка начального города
  useEffect(() => {
    const initCity = { name: 'Москва', lat: 55.75, lon: 37.62 };
    selectCity(initCity);
  }, []);

  // Обновление каждые 3 часа
  useEffect(() => {
    const interval = setInterval(() => {
      if (weatherData && weatherData.city) {
        const cityName = weatherData.city.name;
        const cityCoords = { 
          name: cityName, 
          lat: weatherData.city.coord?.lat || 55.75, 
          lon: weatherData.city.coord?.lon || 37.62 
        };
        selectCity(cityCoords);
      }
    }, 3 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [weatherData, selectCity]);

  return {
    city,
    citySuggestions,
    weatherData,
    airQuality,
    loading,
    error,
    lastUpdate,
    searchCity: searchCityHandler,
    selectCity
  };
};