import React from 'react';
import CitySearch from './components/city_search';
import WeatherCard from './components/weather_card';
import ForecastList from './components/forecast_list';
import AirQuality from './components/air_quality';
import { useWeather } from './hooks/use_weather';
import './App.css';

function App() {
  const {
    city,
    citySuggestions,
    weatherData,
    airQuality,
    loading,
    error,
    lastUpdate,
    searchCity,
    selectCity
  } = useWeather();

  // Определяем класс фона в зависимости от погоды
  const getBackgroundClass = () => {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
      return 'bg-default';
    }
    
    const weatherId = weatherData.list[0]?.weather[0]?.id || 800;
    
    if (weatherId === 800) return 'bg-clear';
    if (weatherId === 801) return 'bg-few-clouds';
    if (weatherId > 801 && weatherId < 810) return 'bg-clouds';
    if (weatherId >= 300 && weatherId < 600) return 'bg-rain';
    if (weatherId >= 600 && weatherId < 700) return 'bg-snow';
    if (weatherId >= 200 && weatherId < 300) return 'bg-thunderstorm';
    return 'bg-default';
  };

  const currentWeather = weatherData?.list?.[0];

  return (
    <div className={`app ${getBackgroundClass()}`}>
      <div className="container">
        <header className="header">
          <h1>Погодный помощник</h1>
          <CitySearch 
            onSearch={searchCity}
            onSelect={selectCity}
            suggestions={citySuggestions}
            loading={loading}
          />
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка данных о погоде...</p>
          </div>
        )}

        {!loading && weatherData && (
          <>
            <div className="city-name">
              <h2>{weatherData.city?.name}, {weatherData.city?.country}</h2>
              {lastUpdate && (
                <div className="last-update">
                  Обновлено: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            {currentWeather && (
              <WeatherCard weather={currentWeather} isToday={true} />
            )}

            <div className="weather-sections">
              <ForecastList forecasts={weatherData.list} />
              <AirQuality data={airQuality} />
            </div>
          </>
        )}

        <footer className="footer">
          <p>Данные предоставлены OpenWeather API | Обновление каждые 3 часа</p>
        </footer>
      </div>
    </div>
  );
}

export default App;