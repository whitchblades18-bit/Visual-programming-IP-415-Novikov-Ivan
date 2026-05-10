import React from 'react';
import WeatherCard from './weather_card';
import '../css_files/forecast_list.css';

const ForecastList = ({ forecasts }) => {
  if (!forecasts || forecasts.length === 0) return null;

  const getDailyForecasts = () => {
    const dailyMap = new Map();
    
    forecasts.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, forecast);
      }
    });
    
    return Array.from(dailyMap.values()).slice(0, 5);
  };

  const dailyForecasts = getDailyForecasts();

  return (
    <div className="forecast-list">
      <h3 className="section-title">Прогноз на несколько дней</h3>
      <div className="forecast-grid">
        {dailyForecasts.map((forecast, index) => (
          <WeatherCard key={index} weather={forecast} />
        ))}
      </div>
    </div>
  );
};

export default ForecastList;