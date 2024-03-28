import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchComponent from './search/search';
import WatchlistComponent from './watchlist/watchlist';
import PortfolioComponent from './portfolio/portfolio';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/search/home" element={<SearchComponent />} />
                <Route path="" element={<Navigate to="/search/home" />} />
                <Route path="/search/" element={<Navigate to="/search/home" />} />
                <Route path="/search/:symbol" element={<SearchComponent />} />
                <Route path="/watchlist" element={<WatchlistComponent />} />
                <Route path="/portfolio" element={<PortfolioComponent />} />
            </Routes>
            <Footer />
        </Router>

    );
}

export default App;