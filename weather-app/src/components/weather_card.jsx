import React from 'react';
import '../css_files/weather_card.css';

const WeatherCard = ({ weather, isToday = false }) => {
  if (!weather) return null;

  const getWeatherClass = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
    if (weatherId >= 300 && weatherId < 600) return 'rain';
    if (weatherId >= 600 && weatherId < 700) return 'snow';
    if (weatherId >= 700 && weatherId < 800) return 'fog';
    if (weatherId === 800) return 'clear';
    if (weatherId === 801) return 'few-clouds';
    if (weatherId > 801 && weatherId < 810) return 'clouds';
    return 'default';
  };

  const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    if (isToday) return 'Сегодня';
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
  };

  const weatherClass = getWeatherClass(weather.weather[0]?.id || 800);

  return (
    <div className={`weather-card ${weatherClass}`}>
      <div className="weather-date">{formatDate(weather.dt)}</div>
      
      <div className="weather-main">
        <img 
          src={getIconUrl(weather.weather[0]?.icon)} 
          alt={weather.weather[0]?.description}
          className="weather-icon"
        />
        <div className="weather-temp">{Math.round(weather.main.temp)}°</div>
      </div>
      
      <div className="weather-description">
        {weather.weather[0]?.description}
      </div>
      
      <div className="weather-details">
        <div className="detail">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
          </svg>
          <span>Ощущается {Math.round(weather.main.feels_like)}°</span>
        </div>
        <div className="detail">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M6 2h12v20H6V2zm2 2v16h8V4H8z"/>
          </svg>
          <span>Влажность {weather.main.humidity}%</span>
        </div>
        <div className="detail">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
          </svg>
          <span>Ветер {weather.wind.speed} м/с</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;