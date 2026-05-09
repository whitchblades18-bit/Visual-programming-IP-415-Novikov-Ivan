import React, { useState, useCallback } from 'react';
import '../css_files/city_search.css';

const CitySearch = ({ onSearch, onSelect, suggestions, loading }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleSelectCity = useCallback((city) => {
    setQuery(`${city.name}, ${city.country}`);
    onSelect(city);
    onSearch('');
  }, [onSelect, onSearch]);

  return (
    <div className="city-search">
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Поиск города..."
          className="search-input"
          disabled={loading}
        />
        <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </div>
      
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((city, index) => (
            <li 
              key={index}
              onClick={() => handleSelectCity(city)}
              className="suggestion-item"
            >
              <strong>{city.name}</strong>
              {city.state && <span>, {city.state}</span>}
              <span>, {city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitySearch;