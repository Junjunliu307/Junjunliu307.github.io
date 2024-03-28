import React, { useState, useEffect } from 'react';
import './header.css';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; // 导入 FontAwesome 图标

function Header() {
    const [selectedLink, setSelectedLink] = useState('search');
    const [isMobile, setIsMobile] = useState(false);
    const [showNav, setShowNav] = useState(false)
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
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [location.pathname]);
    const handleClick = () => {
        setShowNav(!showNav)
    }

    return (
        <div>
            <nav className="navbar">
                <div className="left">
                    <span>Stock Search</span>
                </div>
                {
                    !isMobile ?
                        <div className="right">
                            <Link to="/search/home" className={`nav-link ${selectedLink === 'search' ? 'selected' : ''}`}>Search</Link>
                            <Link to="/watchlist" className={`nav-link ${selectedLink === 'watchlist' ? 'selected' : ''}`}>Watchlist</Link>
                            <Link to="/portfolio" className={`nav-link ${selectedLink === 'portfolio' ? 'selected' : ''}`}>Portfolio</Link>
                        </div> : <div className="right">
                            <Button style={{ backgroundColor: 'blue', borderColor: 'blue' }} onClick={handleClick}>
                                <FontAwesomeIcon icon={faBars} style={{ color: 'white' }} />
                            </Button>
                        </div>
                }
            </nav>
            {isMobile && showNav ? <div style={{ width: '100%', display: 'flex', margin: 'auto', backgroundColor: 'blue', textAlign: 'center', flexWrap: 'wrap' }}>
                <Link to="/" className={`nav-link ${selectedLink === 'search' ? 'selected' : ''}`} style={{ width: '100%' }}>Search</Link>
                <Link to="/watchlist" className={`nav-link ${selectedLink === 'watchlist' ? 'selected' : ''}`} style={{ width: '100%' }}>Watchlist</Link>
                <Link to="/portfolio" className={`nav-link ${selectedLink === 'portfolio' ? 'selected' : ''}`} style={{ width: '100%' }}>Portfolio</Link>
            </div> : null}
        </div>
    );
}

export default Header;


