import './search.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'
const tokenP = 'fSelM6w8GpMT23I9Cf6pwdkQNtl6OiJG'

const SearchComponent = () => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState({})
  const [showSearchResultComponent, setShowSearchResultComponent] = useState(false)
  const navigate = useNavigate()
  const { symbol } = useParams()

  const handleClear = () => {
    if (inputValue) {
      setInputValue('');
    }
    setShowSearchResultComponent(false)
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSuggestions([])
    setLoading(true);
    // 发起API请求
    const apiUrl = `https://finnhub.io/api/v1/search?q=${value}&token=${tokenF}`
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setSuggestions(data.result)
        setLoading(false);
      })
      .catch(error => console.error('Error:', error));
  };
  const handleClick = (value) => {
    setInputValue(value)
    setSuggestions([])
    navigate(`/search/${value}`);
    setShowSearchResultComponent(true)
    doSearch(value)
  };

  const handleSearch = () => {
    setSuggestions([]);
    navigate(`/search/${inputValue}`);
    setShowSearchResultComponent(true)
    doSearch(inputValue)
  };

  const doSearch = (input) => {
    const apiUrl = `http://127.0.0.1:8000/search?symbol=${symbol}&tokenF=${tokenF}&tokenP=${tokenP}/`
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setStockData(data)
      })
      .catch(error => console.error('Error:', error));
  }
  useEffect(() => {
    if (symbol !== undefined) {
      setShowSearchResultComponent(true)
      doSearch(symbol)
    }
  }, [])

  const ResultComponent = () => {
    return (
      < div >
        {stockData ? (
          <div className='resultComponet'>
            <br />
            {stockData && <img src={stockData.logo} />}
          </div>
        ) : (
          <ClipLoader size={15} color="#blue" loading={true} />
        )}
      </div >
    )
  }
  return (
    <div className="search-container">
      <h2>STOCK SEARCH</h2>
      <div className="input-group">
        <input className="search-input" type="text" value={inputValue} placeholder="Enter stock ticker symbol" onChange={handleChange} style={{ border: 'none', borderRadius: '1.5rem' }} />
        <ul className="dropdown-menu">
          {suggestions.map((item, index) => (
            <li key={index} onClick={() => handleClick(item.symbol)}>{item.symbol + " | " + item.description}</li>
          ))}
          {loading && (
            <li className="loading-icon">
              <ClipLoader size={15} color="#blue" loading={true} />
            </li>
          )}
        </ul>
        <button style={{ border: 'none', background: 'transparent' }} onClick={handleSearch}><FaSearch /></button>
        <button style={{ border: 'none', background: 'transparent' }} onClick={handleClear}><FaTimes /></button>
      </div>
      {showSearchResultComponent && <ResultComponent />}
    </div >
  );
}

export default SearchComponent;
