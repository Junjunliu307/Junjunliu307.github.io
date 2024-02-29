import React, { useState } from 'react';
import './header.css';
import { Link } from 'react-router-dom';

function Header() {
    const [selectedLink, setSelectedLink] = useState('search');

    const handleLinkClick = (linkName) => {
        setSelectedLink(linkName);
    };
    return (
        <nav className="navbar">
            <div className="left">
                <span>Stock Search</span>
            </div>
            <div className="right">
                <a href="#" className={`nav-link ${selectedLink === 'search' ? 'selected' : ''}`} onClick={() => handleLinkClick('search')}>Search</a>
                <a href="#" className={`nav-link ${selectedLink === 'watchlist' ? 'selected' : ''}`} onClick={() => handleLinkClick('watchlist')}>Watchlist</a>
                <a href="#" className={`nav-link ${selectedLink === 'portfolio' ? 'selected' : ''}`} onClick={() => handleLinkClick('portfolio')}>Portfolio</a>
            </div>
        </nav>
    );
}

export default Header;
