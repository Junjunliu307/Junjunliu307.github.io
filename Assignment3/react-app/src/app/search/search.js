import './search.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { Button, Modal } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BiCaretUp, BiCaretDown } from 'react-icons/bi';
import { BsStarFill, BsStar } from 'react-icons/bs';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import XIcon from '../../assets/x.png'
import FacebookIcon from '../../assets/facebook.png'
import indicators from 'highcharts/indicators/indicators';
import volumeByPrice from 'highcharts/indicators/volume-by-price';
import { Alert } from 'react-bootstrap';

const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'
const tokenP = 'fSelM6w8GpMT23I9Cf6pwdkQNtl6OiJG'
indicators(Highcharts);
volumeByPrice(Highcharts);

const SearchComponent = () => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [stockData, setStockData] = useState({})
  const [userData, setUserData] = useState({})
  const [isFavorite, setIsFavorite] = useState(false);
  const [ownership, setOwnership] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeColor, setNoticeColor] = useState('');
  const [loadingResult, setLoadingResult] = useState(false);
  const [showSearchResultComponent, setShowSearchResultComponent] = useState(false);
  const [selectedButton, setSelectedButton] = useState('summary');
  const [newsModalVisible, setNewsModalVisible] = useState(false);
  const [dealModalVisible, setDealModalVisible] = useState(false);
  const [dealState, setDealState] = useState('')
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate()
  const { symbol } = useParams()

  var singleRequest = true //use to avoid repeat effect
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
    setSuggestLoading(true);
    fetch(`http://localhost:8000/autoComplete?q=${value}&tokenF=${tokenF}`)
      .then(response => response.json())
      .then(data => {
        setSuggestions(data.result)
        setSuggestLoading(false);
      })
      .catch(error => console.error('Error:', error));
  };
  const handleClick = (value) => {
    setInputValue(value)
    setSuggestions([])
    navigate(`/search/${value}`);
  };

  const handleSearch = () => {
    setSuggestions([]);
    navigate(`/search/${inputValue}`);
  };
  const showNotice = (content, color) => {
    setNoticeColor(color)
    setNoticeContent(content)
    setNoticeVisible(true)
    setTimeout(() => {
      setNoticeVisible(false);
    }, 3000)
  }
  useEffect(() => {
    if (symbol && singleRequest) {
      setLoadingResult(true)
      singleRequest = !singleRequest
      setStockData({})
      fetch(`http://127.0.0.1:8000/search?symbol=${symbol}&tokenF=${tokenF}&tokenP=${tokenP}`)
        .then(response => response.json())
        .then(data => {
          setStockData(data)
          setSelectedNews(data.latestNews[0])
          setShowSearchResultComponent(true)
          setLoadingResult(false)
        })
        .catch(error => console.error('Error:', error));
      fetch(`http://localhost:8000/queryUserData`)
        .then(response => response.json())
        .then(data => {
          setUserData(data)
          setIsFavorite(data.watchlist.includes(symbol))
          setOwnership(symbol in data.portfolio)
        })
        .catch(error => console.error('Error:', error));
    }
  }, [symbol])

  const ResultComponent = () => {
    const [dealInput, setDealInput] = useState(0)
    const handleNewsClick = (news) => {
      setSelectedNews(news)
      setNewsModalVisible(true)
    }
    const handleFavorite = () => {
      fetch(`http://localhost:8000/handleWatchList?symbol=${symbol}`)
        .then(response => response.json())
        .then(data => {
          setUserData(data)
          setIsFavorite(data.watchlist.includes(symbol))
          if (data.watchlist.includes(symbol)) {
            showNotice(`${symbol} add to Watchlist`, 'rgba(0, 255, 0, 0.3)')
          } else {
            showNotice(`${symbol} remove from Watchlist`, 'rgba(255, 0, 0, 0.3)')
          }
        })
        .catch(error => console.error('Error:', error));
    }
    const clickDeal = () => {
      setDealModalVisible(true)
    }
    const handleDeal = () => {
      var url = ''
      if (dealState === 'buy') {
        url = `http://localhost:8000/makeDeal?symbol=${symbol}&num=${dealInput}&price=${stockData.c}`
      } else if (dealState === 'sell') {
        url = `http://localhost:8000/makeDeal?symbol=${symbol}&num=-${dealInput}&price=${stockData.c}`
      }
      fetch(url)
        .then(response => response.json())
        .then(data => {
          setUserData(data)
          setDealModalVisible(false)
          dealState === 'buy' ? showNotice(`${symbol} bought successfully`, 'rgba(0, 255, 0, 0.3)') : showNotice(`${symbol} sold successfully`, 'rgba(255, 0, 0, 0.3)')
          setOwnership(symbol in data.portfolio)
        })
        .catch(error => console.error('Error:', error));
    }
    const handleInputChange = (event) => {
      const inputValue = (parseInt(event.target.value) || 0)
      setDealInput(inputValue >= 0 ? inputValue : 0); // 确保输入的值为数字，如果不是数字则设为 0
    };

    const transTimeFormat = (timestamp) => {
      let date = new Date(timestamp);

      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0');
      let day = String(date.getDate()).padStart(2, '0');
      let hours = String(date.getHours()).padStart(2, '0');
      let minutes = String(date.getMinutes()).padStart(2, '0');
      let seconds = String(date.getSeconds()).padStart(2, '0');

      let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      return formattedDateTime
    }
    const convertUnixEpochToDateFormat = (unixEpochTime) => {
      const date = new Date(unixEpochTime * 1000);
      const day = date.toLocaleString('en-UK', { day: '2-digit' });
      const month = date.toLocaleString('en-UK', { month: 'long' });
      const year = date.toLocaleString('en-UK', { year: 'numeric' });

      return `${day} ${month}, ${year}`;
    }
    // split the data set into ohlc and volume
    const ohlc = [],
      volume = [],
      dataLength = stockData.chartData.length,
      // set the allowed units for data grouping
      groupingUnits = [[
        'week',                         // unit name
        [1]                             // allowed multiples
      ], [
        'month',
        [1, 2, 3, 4, 6]
      ]];
    for (let i = 0; i < dataLength; i += 1) {
      ohlc.push([
        stockData.chartData[i][0], // the date
        stockData.chartData[i][1], // open
        stockData.chartData[i][2], // high
        stockData.chartData[i][3], // low
        stockData.chartData[i][4] // close
      ]);

      volume.push([
        stockData.chartData[i][0], // the date
        stockData.chartData[i][5] // the volume
      ]);
    }
    var MSPRTotal = 0, MSPRPositive = 0, MSPRNegative = 0
    var ChangeTotal = 0, ChangePositive = 0, ChangeNegative = 0
    for (let i = 0; i < stockData.insiderSentiment.data.length; i += 1) {
      let mspr = stockData.insiderSentiment.data[i].mspr
      let change = stockData.insiderSentiment.data[i].change
      if (mspr > 0) { MSPRPositive += mspr }
      else { MSPRNegative += mspr }
      if (change > 0) { ChangePositive += change }
      else { ChangeNegative += change }
      MSPRTotal += mspr
      ChangeTotal += change
    }

    // 提取日期、实际 EPS 和估计 EPS 列表
    var dates = stockData.earnings.map(item => item.period);
    var actualEPS = stockData.earnings.map(item => item.actual);
    var estimateEPS = stockData.earnings.map(item => item.estimate);


    let stockName = (
      <div className='overviewItem'>
        <p style={{ fontSize: '30px', fontWeight: 'bold', margin: '0px' }}>{stockData.ticker}<button className='favoriteButton' onClick={handleFavorite}>
          {isFavorite ? <BsStarFill size={25} color={'gold'} /> : <BsStar size={25} color={'black'} />}
        </button>
        </p>
        <p style={{ fontSize: '20px', fontWeight: 'bolder', color: 'gray', margin: '0px' }}>{stockData.name}</p>
        <p style={{ fontSize: '10px', color: 'gray', margin: '5px' }}>{stockData.exchange}</p>
        <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => { clickDeal(); setDealState('buy') }}>Buy</Button>
        {ownership && <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => { clickDeal(); setDealState('sell') }}>Sell</Button>}
      </div >
    )
    let stockLogo = (
      <div className='overviewItem'>
        <img src={stockData.logo} alt='stockLogo' style={{ width: '100px', height: '100px' }}></img>
        {Math.abs(Date.now() - stockData.t * 1000) <= 60 * 1000 ? <p style={{ color: 'green' }}>Market is Open</p> : <p style={{ color: 'red' }}>Market is Close on {transTimeFormat(stockData.t * 1000)}</p>}
      </div>
    )
    let stockPrice = (
      <div className='overviewItem'>
        <p style={{ color: stockData.d > 0 ? 'green' : 'red', fontSize: '30px', fontWeight: 'bold', margin: '0px' }}>{stockData.c}</p>
        <p style={{ color: stockData.d > 0 ? 'green' : 'red', fontSize: '20px', fontWeight: 'bolder', margin: '5px' }}>{stockData.d > 0 ? <BiCaretUp style={{ color: 'green' }} /> : <BiCaretDown style={{ color: 'red' }} />} {Math.abs(stockData.d)} ({Math.abs(stockData.dp)}%)</p>
        <p style={{ fontSize: '12px', color: 'gray', margin: '0px' }}>{transTimeFormat(Date.now())}</p>
      </div>
    )
    let summary = (
      <div className='summary'>
        <div className='summaryLeft'>
          <div style={{ textAlign: 'left' }}>
            <p><span style={{ fontWeight: 'bold' }}>High Price: </span>{stockData.h}</p>
            <p><span style={{ fontWeight: 'bold' }}>Low Price: </span>{stockData.l}</p>
            <p><span style={{ fontWeight: 'bold' }}>Open Price: </span>{stockData.o}</p>
            <p><span style={{ fontWeight: 'bold' }}>Prev.Close: </span>{stockData.pc}</p>
          </div>
          <br />
          <div>
            <a href={stockData.weburl} style={{ fontWeight: 'bold', color: 'black' }}>About the company</a>
            <p><span style={{ fontWeight: 'bold' }}>IPO Start Date: </span>{stockData.ipo}</p>
            <p><span style={{ fontWeight: 'bold' }}>Industry: </span>{stockData.finnhubIndustry}</p>
            <p><span style={{ fontWeight: 'bold' }}>Webpage: </span><a href={stockData.weburl}>{stockData.weburl}</a></p>
            <p><span style={{ fontWeight: 'bold' }}>Company peers:</span></p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {stockData.peers.map((item, index) => (
                <span key={index}>
                  <a href={'/search/' + item}>{item}</a>
                  {index !== stockData.peers.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className='summaryRight'>
          <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={{
              chart: {
                backgroundColor: '#F5F5F5' // 设置背景色为灰色
              },
              navigator: {
                enabled: false // 设置为false以隐藏导航器
              },
              rangeSelector: {
                buttons: [],
                inputEnabled: false
              },
              title: {
                text: `${stockData.ticker} Hourly Price Variation`
              },
              series: [{
                data: stockData.hourlyData
              },]
            }}
          />
        </div>
      </div >
    )
    let news = (
      <div className='newsContainer'>
        {stockData.latestNews.map((news, index) => (
          <div className='newsCard' key={index} onClick={() => handleNewsClick(news)}>
            <img src={news.image} alt='newsImage'></img>
            <p>{news.headline}</p>
          </div>
        ))
        }
      </div>
    )
    let charts = (
      <div className='chartsContainer'>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={{
            chart: {
              backgroundColor: '#F5F5F5' // 设置背景色为灰色
            },
            rangeSelector: {
              selected: 2
            },

            title: {
              text: `${stockData.ticker} Historical`
            },

            subtitle: {
              text: 'With SMA and Volume by Price technical indicators'
            },

            yAxis: [{
              startOnTick: false,
              endOnTick: false,
              labels: {
                align: 'right',
                x: -3
              },
              title: {
                text: 'OHLC'
              },
              height: '60%',
              lineWidth: 2,
              resize: {
                enabled: true
              }
            }, {
              labels: {
                align: 'right',
                x: -3
              },
              title: {
                text: 'Volume'
              },
              top: '65%',
              height: '35%',
              offset: 0,
              lineWidth: 2
            }],

            tooltip: {
              split: true
            },

            plotOptions: {
              series: {
                dataGrouping: {
                  units: groupingUnits
                }
              }
            },

            series: [{
              type: 'candlestick',
              name: `${stockData.ticker}`,
              id: `${stockData.ticker}`,
              zIndex: 2,
              data: ohlc
            }, {
              type: 'column',
              name: 'Volume',
              id: 'volume',
              data: volume,
              yAxis: 1
            }, {
              type: 'vbp',
              linkedTo: `${stockData.ticker}`,
              params: {
                volumeSeriesID: 'volume'
              },
              dataLabels: {
                enabled: false
              },
              zoneLines: {
                enabled: false
              }
            }, {
              type: 'sma',
              linkedTo: `${stockData.ticker}`,
              zIndex: 1,
              marker: {
                enabled: false
              }
            }]
          }}
        />
      </div>
    )
    let insights = (
      <div className='insightsContainer' align='center'>
        <div className='insightsTop'>
          <table style={{ borderCollapse: 'collapse', width: '60%' }}>
            <caption style={{ fontSize: '20px' }}>Insider Sentiments</caption>
            <thead>
              <tr style={{ borderBottom: '1px solid black' }}>
                <th align="center">{stockData.name}</th>
                <th align="center">MSPR</th>
                <th align="center">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid black' }}><th align="center">Total</th><td align="center">{parseFloat(MSPRTotal).toFixed(2)}</td><td align="center">{parseFloat(ChangeTotal).toFixed(2)}</td></tr>
              <tr style={{ borderBottom: '1px solid black' }}><th align="center">Positive</th><td align="center">{parseFloat(MSPRPositive).toFixed(2)}</td><td align="center">{parseFloat(ChangePositive).toFixed(2)}</td></tr>
              <tr style={{ borderBottom: '1px solid black' }}><th align="center">Negative</th><td align="center">{parseFloat(MSPRNegative).toFixed(2)}</td><td align="center">{parseFloat(ChangeNegative).toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className='insightsBottom'>
          <div className='recommendationTrends'>
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: 'column',
                  backgroundColor: '#F5F5F5' // 设置背景色为灰色
                },
                navigator: {
                  enabled: false // 设置为false以隐藏导航器
                },
                rangeSelector: {
                  buttons: [],
                  inputEnabled: false
                },
                title: {
                  text: 'Recommendation Trends'
                },
                xAxis: {
                  type: 'datetime',
                },
                yAxis: {
                  title: {
                    text: '#Analysis'
                  }
                },
                plotOptions: {
                  column: {
                    stacking: 'normal'
                  }
                },
                series: [{
                  name: 'Buy',
                  color: '#7cb5ec',
                  data: stockData.recommendationData.map(point => [new Date(point.period).getTime(), point.buy])
                }, {
                  name: 'Hold',
                  color: '#434348',
                  data: stockData.recommendationData.map(point => [new Date(point.period).getTime(), point.hold])
                }, {
                  name: 'Sell',
                  color: '#90ed7d',
                  data: stockData.recommendationData.map(point => [new Date(point.period).getTime(), point.sell])
                }, {
                  name: 'Strong Buy',
                  color: '#f7a35c',
                  data: stockData.recommendationData.map(point => [new Date(point.period).getTime(), point.strongBuy])
                }, {
                  name: 'Strong Sell',
                  color: '#8085e9',
                  data: stockData.recommendationData.map(point => [new Date(point.period).getTime(), point.strongSell])
                }]
              }}
            />
          </div>
          <div className='epsSurprises'>
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={'stockChart'}
              options={{
                chart: {
                  backgroundColor: '#F5F5F5' // 设置背景色为灰色
                },
                navigator: {
                  enabled: false // 设置为false以隐藏导航器
                },
                rangeSelector: {
                  buttons: [],
                  inputEnabled: false
                },
                title: {
                  text: 'Historical EPS Surprises'
                },
                xAxis: {
                  categories: dates,
                },
                yAxis: {
                  title: {
                    text: 'Quarterly EPS'
                  },
                  opposite: false
                },
                series: [{
                  name: 'Actual EPS',
                  type: 'spline',
                  color: 'blue',
                  data: actualEPS
                }, {
                  name: 'Estimate EPS',
                  type: 'spline',
                  color: 'black',
                  data: estimateEPS
                }]
              }}
            />
          </div>
        </div>
      </div>
    )
    const renderContent = () => {
      switch (selectedButton) {
        case 'summary':
          return summary;
        case 'news':
          return news;
        case 'charts':
          return charts;
        case 'insights':
          return insights;
        default:
          return null;
      }
    };
    return (
      < div className='resultComponet'>
        {stockData.ticker ? (
          < div >
            <Modal open={newsModalVisible} title='' onCancel={() => { setNewsModalVisible(false) }}
              footer={<div className='newsModalFooter'>
                <p>Share</p>
                <a className="shareButton"
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(selectedNews.url)}&text=${encodeURIComponent(selectedNews.headline)}`}
                  target="_blank" rel="noreferrer">
                  <img src={XIcon} alt="Twitter Share" />
                </a>
                <a className="shareButton"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedNews.url)}`}
                  target="_blank" rel="noreferrer">
                  <img src={FacebookIcon} alt="Facebook Share" />
                </a>

              </div>}>
              <p style={{ fontSize: '30px', fontWeight: 'bold', margin: '0' }}>{selectedNews.source}</p>
              <p style={{ fontSize: '15px', color: 'gray', margin: '0' }}>{convertUnixEpochToDateFormat(selectedNews.datetime)}</p>
              <hr style={{ color: 'gray' }} />

              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedNews.headline}</p>
              <p style={{ margin: '0' }}>{selectedNews.summary}</p>
              <p>For more datails click <a href={selectedNews.url} target="_blank" rel="noreferrer">here</a></p>
            </Modal>

            <Modal open={dealModalVisible} title={symbol} onCancel={() => { setDealModalVisible(false) }}
              footer={dealState === 'buy' ?
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><p>Total: {stockData.c * dealInput}</p><Button style={{ backgroundColor: 'green', color: 'white', opacity: dealInput * stockData.c > parseFloat(userData.money) ? '0.5' : '1' }} onClick={handleDeal} disabled={dealInput * stockData.c > parseFloat(userData.money)}>Buy</Button>
                </div> : <div style={{ display: 'flex', justifyContent: 'space-between' }}><p>Total: {stockData.c * dealInput}</p><Button style={{ backgroundColor: 'red', color: 'white', opacity: userData.portfolio[symbol] && dealInput > userData.portfolio[symbol].length ? '0.5' : '1' }} onClick={handleDeal} disabled={userData.portfolio[symbol] && dealInput > userData.portfolio[symbol].length}>Sell</Button></div>}>
              <div style={{ border: '1px solid #ccc', borderLeft: 'none', borderRight: 'none' }}>
                <p>Current Price: {stockData.c}</p>
                <p>Money in Wallet: ${parseFloat(userData.money).toFixed(2)}</p>
                <p>Quantity <input
                  type="number"
                  value={dealInput}
                  onChange={handleInputChange}
                /></p>
                {(dealState === 'buy' && dealInput * stockData.c > parseFloat(userData.money)) ? <p style={{ color: 'red' }}>Not enough money in wallet!</p> : null}
                {(dealState === 'sell' && userData.portfolio[symbol] && dealInput > userData.portfolio[symbol].length) ? <p style={{ color: 'red' }}>You cannot sell the stocks that you don't have!</p> : null}
              </div>
            </Modal>

            <div className='stockOverview'>
              {stockName}
              {stockLogo}
              {stockPrice}
            </div>
            <div className='stockDetail'>
              <div className='buttonContainer'>
                <button id="summary" className={selectedButton === 'summary' ? 'clicked' : ''} onClick={() => setSelectedButton('summary')}>Summary</button>
                <button id="news" className={selectedButton === 'news' ? 'clicked' : ''} onClick={() => setSelectedButton('news')}>Top News</button>
                <button id="charts" className={selectedButton === 'charts' ? 'clicked' : ''} onClick={() => setSelectedButton('charts')}>Charts</button>
                <button id="insights" className={selectedButton === 'insights' ? 'clicked' : ''} onClick={() => setSelectedButton('insights')}>Insights</button>
              </div>
              {renderContent()}
            </div >
          </div>
        ) : (
          window.location.pathname !== '/search/' ?
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 0, 0, 0.3)', borderRadius: '1rem', padding: '0.1% 0% 0.1% 0%' }}>
              <p>No data found, Please enter a valid Ticker</p>
            </div> : null
        )}
      </div >
    )
  }
  return (
    <div className="search-container">
      <p style={{ fontSize: '30px' }}>STOCK SEARCH</p>
      <div className="input-group">
        <input className="search-input" type="text" value={inputValue} placeholder="Enter stock ticker symbol" onChange={handleChange} style={{ border: 'none', borderRadius: '1.5rem' }} />
        <ul className="dropdown-menu">
          {suggestions.map((item, index) => (
            <li key={index} onClick={() => handleClick(item.symbol)}>{item.symbol + " | " + item.description}</li>
          ))}
          {suggestLoading && (
            <li className="loading-icon">
              <ClipLoader size={15} color="#blue" loading={true} />
            </li>
          )}
        </ul>
        <button style={{ border: 'none', background: 'transparent' }} onClick={handleSearch}><FaSearch /></button>
        <button style={{ border: 'none', background: 'transparent' }} onClick={handleClear}><FaTimes /></button>
      </div>
      {window.location.pathname === '/search/' ? <div style={{ textAlign: 'center', backgroundColor: 'rgba(255, 0, 0, 0.3)', borderRadius: '1rem', width: '80%', margin: 'auto', padding: '0.1% 0% 0.1% 0%', marginTop: '3%' }}>
        <p>Please enter a valid Ticker</p>
      </div> : null}
      <Alert show={noticeVisible} variant="success" onClose={() => setNoticeVisible(false)} style={{ background: noticeColor, width: '80%', margin: 'auto', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '1' }}>{noticeContent}</div>
        <div>
          <button type="button" aria-label="Close" style={{ backgroundColor: 'transparent', border: 'none' }}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </Alert>
      {loadingResult && <div><ClipLoader size={15} color="#blue" loading={true} /></div>}
      {showSearchResultComponent && <ResultComponent />}
    </div >
  );
}

export default SearchComponent;
