import './watchlist.css';
import React, { useState, useEffect } from 'react';
import { BiCaretUp, BiCaretDown } from 'react-icons/bi';
import { ClipLoader } from 'react-spinners';

const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'

const WatchlistComponent = () => {
    const [loadingResult, setLoadingResult] = useState(true);
    const [userData, setUserData] = useState({});
    const [stockData, setStockData] = useState([]);
    const [reLoadFlag, setReLoadFlag] = useState(true)
    const handleDelete = (ticker) => {
        fetch(`http://localhost:8000/handleWatchList?symbol=${ticker}`)
            .then(response => response.json())
            .then(data => {
                setReLoadFlag(!reLoadFlag)
            })
            .catch(error => console.error('Error:', error));
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userDataResponse = await fetch(`http://localhost:8000/queryUserData`);
                const userData = await userDataResponse.json();
                setUserData(userData);
                var temp = []

                for (const element of userData.watchlist) {
                    const stockResponse = await fetch(`http://localhost:8000/queryStock?symbol=${element}&tokenF=${tokenF}`);
                    const singleStock = await stockResponse.json();
                    temp = [...temp, singleStock]
                }
                setStockData(temp)
                setLoadingResult(false);
            } catch (error) {
                console.error('Error:', error);
                setLoadingResult(false);
            }
        };

        fetchData();
    }, [reLoadFlag]);

    return (
        <div className="watchlist">
            <h1>My Watchlist</h1>
            {!loadingResult ? stockData.map((stock, index) => (
                <div key={index} className='stockCard'>
                    <table style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <td><button onClick={() => { handleDelete(stock.ticker) }} style={{ border: 'none', backgroundColor: 'white' }}>x</button></td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{stock.ticker}</td>
                                <td><p style={{ color: stock.d > 0 ? 'green' : 'red' }}>{stock.c}</p></td>
                            </tr>
                            <tr>
                                <td>{stock.name}</td>
                                <td><p style={{ color: stock.d > 0 ? 'green' : 'red' }}>{stock.d > 0 ? <BiCaretUp style={{ color: 'green' }} /> : <BiCaretDown style={{ color: 'red' }} />}{Math.abs(stock.d)}({Math.abs(stock.dp)}%)</p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            )) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ClipLoader size={30} color="blue" loading={true} />
                </div>
            )}
        </div>
    );
}

export default WatchlistComponent;
