import React from 'react';
import './home.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaSearch, FaTimes } from 'react-icons/fa'; // 导入Font Awesome图标

function Home() {
  return (
    <div className="home">
      <Header />
      <SearchComponent />
      <Footer />
    </div>
  );
}

function SearchComponent() {
  const handleClear = () => {
    const input = document.querySelector('.search-input');
    if (input) {
      input.value = '';
    }
  };
  return (
    <div className="search-container">
      <h2>Stock Search</h2>
      <div className="input-group" style={{ display: 'inline-flex', border: '1px solid #ccc', borderRadius: '1.5rem' }}>
        <input type="text" className="search-input" placeholder="Enter stock ticker symbol" style={{ border: 'none', borderRadius: '1.5rem' }} />
        <button className="btn btn-search" type="button" style={{ border: 'none', background: 'transparent' }}><FaSearch /></button>
        <button className="btn btn-clear" type="button" style={{ border: 'none', background: 'transparent' }} onClick={handleClear}><FaTimes /></button>
      </div>
    </div >
  );
}

export default Home;
