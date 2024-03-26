import './portfolio.css';
import React, { useState, useEffect } from 'react';
import { BiCaretUp, BiCaretDown } from 'react-icons/bi';
import { ClipLoader } from 'react-spinners';
import { Button, Modal } from 'antd';
import { Alert } from 'react-bootstrap';

const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'

const PortfolioComponent = () => {
    const [loadingResult, setLoadingResult] = useState(true);
    const [userData, setUserData] = useState({});
    const [stockData, setStockData] = useState([]);
    const [reLoadFlag, setReLoadFlag] = useState(true)
    const [dealState, setDealState] = useState('')
    const [dealModalVisible, setDealModalVisible] = useState(false);
    const [dealInput, setDealInput] = useState(0)
    const [selectedStock, setSelectedStock] = useState({});
    const [noticeVisible, setNoticeVisible] = useState(false);
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeColor, setNoticeColor] = useState('');

    const clickDeal = (stock) => {
        setDealModalVisible(true)
        setSelectedStock(stock)
    }
    const handleInputChange = (event) => {
        const inputValue = (parseInt(event.target.value) || 0)
        setDealInput(inputValue >= 0 ? inputValue : 0); // 确保输入的值为数字，如果不是数字则设为 0
    };
    const showNotice = (content, color) => {
        setNoticeColor(color)
        setNoticeContent(content)
        setNoticeVisible(true)
        setTimeout(() => {
            setNoticeVisible(false);
        }, 3000)
    }
    const handleDeal = () => {
        var url = ''
        if (dealState === 'buy') {
            url = `http://localhost:8000/makeDeal?symbol=${selectedStock.ticker}&num=${dealInput}&price=${selectedStock.c}`
        } else if (dealState === 'sell') {
            url = `http://localhost:8000/makeDeal?symbol=${selectedStock.ticker}&num=-${dealInput}&price=${selectedStock.c}`
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                setUserData(data)
                setDealModalVisible(false)
                dealState === 'buy' ? showNotice(`${selectedStock.ticker} bought successfully`, 'rgba(0, 255, 0, 0.3)') : showNotice(`${selectedStock.ticker} sold successfully`, 'rgba(255, 0, 0, 0.3)')
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
                for (const element in userData.portfolio) {
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
        <div className="portfolio">
            <h1>My Portfolio</h1>
            <h2>Money in Wallet: ${parseFloat(userData.money).toFixed(2)}</h2>
            <div style={{ textAlign: 'center' }}>
                <Alert show={noticeVisible} variant="success" onClose={() => setNoticeVisible(false)} style={{ background: noticeColor, width: '100%', margin: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flex: '1' }}>{noticeContent}</div>
                    <div>
                        <button type="button" aria-label="Close" style={{ backgroundColor: 'transparent', border: 'none' }}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </Alert>
            </div>

            {selectedStock.ticker ? <Modal open={dealModalVisible} title={selectedStock.ticker} onCancel={() => { setDealModalVisible(false) }}
                footer={dealState === 'buy' ?
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><p>Total: {selectedStock.c * dealInput}</p><Button style={{ backgroundColor: 'green', color: 'white', opacity: dealInput * selectedStock.c > parseFloat(userData.money) ? '0.5' : '1' }} onClick={handleDeal} disabled={dealInput * selectedStock.c > parseFloat(userData.money)}>Buy</Button>
                    </div> : <div style={{ display: 'flex', justifyContent: 'space-between' }}><p>Total: {selectedStock.c * dealInput}</p><Button style={{ backgroundColor: 'red', color: 'white', opacity: dealInput > userData.portfolio[selectedStock.ticker].length ? '0.5' : '1' }} onClick={handleDeal} disabled={dealInput > userData.portfolio[selectedStock.ticker].length}>Sell</Button></div>}>
                <div style={{ border: '1px solid #ccc', borderLeft: 'none', borderRight: 'none' }}>
                    <p>Current Price: {selectedStock.c}</p>
                    <p>Money in Wallet: ${parseFloat(userData.money).toFixed(2)}</p>
                    <p>Quantity <input
                        type="number"
                        value={dealInput}
                        onChange={handleInputChange}
                    /></p>
                    {(dealState === 'buy' && dealInput * selectedStock.c > parseFloat(userData.money)) ? <p style={{ color: 'red' }}>Not enough money in wallet!</p> : null}
                    {(dealState === 'sell' && dealInput > userData.portfolio[selectedStock.ticker].length) ? <p style={{ color: 'red' }}>You cannot sell the stocks that you don't have!</p> : null}
                </div>
            </Modal> : null}
            {!loadingResult ? stockData.map((stock, index) => (
                <div key={index} className='stockCard'>
                    <table style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <td colSpan={4} style={{ borderBottom: '1px solid black', backgroundColor: '#F5F5F5' }}>{stock.ticker} {stock.name}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Quantity:</td>
                                <td>{userData.portfolio[stock.ticker].length}</td>
                                <td>Change:</td>
                                <td><p style={{ color: userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c < 0 ? 'green' : (userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c > 0 ? 'red' : 'black') }}>{userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c > 0 ? <BiCaretDown style={{ color: 'red' }} />
                                    : (userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c < 0 ? <BiCaretUp style={{ color: 'green' }} /> : null)}{Math.abs(userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c).toFixed(2)}</p></td>
                            </tr>
                            <tr>
                                <td>Avg. Cost / Share:</td>
                                <td>{(userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length).toFixed(2)}</td>
                                <td>Current Price:</td>
                                <td><p style={{ color: userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c < 0 ? 'green' : (userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c > 0 ? 'red' : 'black') }}>{stock.c}</p></td>
                            </tr>
                            <tr>
                                <td>Total Cost:</td>
                                <td>{userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0).toFixed(2)}</td>
                                <td>Market Value:</td>
                                <td><p style={{ color: userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c < 0 ? 'green' : (userData.portfolio[stock.ticker].reduce((accumulator, currentValue) => accumulator + currentValue, 0) / userData.portfolio[stock.ticker].length - stock.c > 0 ? 'red' : 'black') }}>{stock.c * userData.portfolio[stock.ticker].length}</p></td>
                            </tr>
                            <tr>
                                <td colSpan={4} style={{ borderTop: '1px solid black', backgroundColor: '#F5F5F5' }}><Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => { clickDeal(stock); setDealState('buy') }}>Buy</Button>
                                    <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => { clickDeal(stock); setDealState('sell') }}>Sell</Button></td>
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

export default PortfolioComponent;
