import React, { useState, useEffect } from 'react';
import './header.css';
import { Link, useLocation } from 'react-router-dom';

function Header() {
    const [selectedLink, setSelectedLink] = useState('search');
    const location = useLocation();

    useEffect(() => {
        // 获取当前路径
        const currentPath = location.pathname;

        // 根据当前路径设置选中的链接
        switch (currentPath) {
            case '/watchlist':
                setSelectedLink('watchlist');
                break;
            case '/portfolio':
                setSelectedLink('portfolio');
                break;
            default:
                setSelectedLink('search');
                break;
        }
    }, [location.pathname]);

    return (
        <nav className="navbar">
            <div className="left">
                <span>Stock Search</span>
            </div>
            <div className="right">
                <Link to="/" className={`nav-link ${selectedLink === 'search' ? 'selected' : ''}`}>Search</Link>
                <Link to="/watchlist" className={`nav-link ${selectedLink === 'watchlist' ? 'selected' : ''}`}>Watchlist</Link>
                <Link to="/portfolio" className={`nav-link ${selectedLink === 'portfolio' ? 'selected' : ''}`}>Portfolio</Link>
            </div>
        </nav>
    );
}

export default Header;
