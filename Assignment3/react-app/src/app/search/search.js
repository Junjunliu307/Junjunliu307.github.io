import './search.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import React, { useState } from 'react';

function SearchComponent() {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleClear = () => {
    const input = document.querySelector('.search-input');
    if (input) {
      input.value = '';
    }
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'
    setInputValue(value);

    // 发起API请求
    const apiUrl = `https://finnhub.io/api/v1/search?q=${value}&token=${tokenF}`
    await fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setSuggestions(data.result)
      })
      .catch(error => console.error('Error:', error));
  };
  const handleClick = (value) => {
    setInputValue(value);
    setSuggestions([]);
  };
  return (
    <div className="search-container">
      <h2>STOCK SEARCH</h2>
      <div className="input-group">
        <input className="search-input" type="text" value={inputValue} placeholder="Enter stock ticker symbol" onChange={handleChange} style={{ border: 'none', borderRadius: '1.5rem' }} />
        <ul className="dropdown-menu">
          {suggestions.map((item, index) => (
            <li key={index} onClick={() => handleClick(item.symbol)}>{item.symbol + " | " + item.description}</li>
          ))}
        </ul>
        <button style={{ border: 'none', background: 'transparent' }}><FaSearch /></button>
        <button style={{ border: 'none', background: 'transparent' }} onClick={handleClear}><FaTimes /></button>
      </div>
    </div>
  );
}

export default SearchComponent;
