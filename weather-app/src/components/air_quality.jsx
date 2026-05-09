import React from 'react';
import '../css_files/air_quality.css';

const AirQuality = ({ data }) => {
  if (!data || !data.list || data.list.length === 0) return null;

  const airData = data.list[0];
  const aqi = airData.main.aqi;
  const components = airData.components;

  const getAqiInfo = (aqiValue) => {
    const levels = {
      1: { text: 'Отличное', color: '#4caf50', description: 'Качество воздуха отличное' },
      2: { text: 'Хорошее', color: '#8bc34a', description: 'Качество воздуха хорошее' },
      3: { text: 'Умеренное', color: '#ffc107', description: 'Качество воздуха удовлетворительное' },
      4: { text: 'Плохое', color: '#ff9800', description: 'Качество воздуха плохое' },
      5: { text: 'Очень плохое', color: '#f44336', description: 'Качество воздуха очень плохое' }
    };
    return levels[aqiValue] || levels[1];
  };

  const aqiInfo = getAqiInfo(aqi);

  return (
    <div className="air-quality">
      <h3 className="section-title">Качество воздуха</h3>
      
      <div className="aqi-container">
        <div className="aqi-main" style={{ borderColor: aqiInfo.color }}>
          <div className="aqi-value" style={{ color: aqiInfo.color }}>
            {aqiInfo.text}
          </div>
          <div className="aqi-description">{aqiInfo.description}</div>
        </div>
        
        <div className="pollutants-grid">
          <div className="pollutant">
            <span className="pollutant-label">PM2.5</span>
            <span className="pollutant-value">{Math.round(components.pm2_5)}</span>
            <span className="pollutant-unit">μg/m³</span>
          </div>
          <div className="pollutant">
            <span className="pollutant-label">PM10</span>
            <span className="pollutant-value">{Math.round(components.pm10)}</span>
            <span className="pollutant-unit">μg/m³</span>
          </div>
          <div className="pollutant">
            <span className="pollutant-label">O₃</span>
            <span className="pollutant-value">{Math.round(components.o3)}</span>
            <span className="pollutant-unit">μg/m³</span>
          </div>
          <div className="pollutant">
            <span className="pollutant-label">NO₂</span>
            <span className="pollutant-value">{Math.round(components.no2)}</span>
            <span className="pollutant-unit">μg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;