var record
var resultElement
const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'
const tokenP = 'fSelM6w8GpMT23I9Cf6pwdkQNtl6OiJG'
// 定义 searchStock 函数
function searchStock() {
    const tokenF = 'cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0'
    const tokenP = 'fSelM6w8GpMT23I9Cf6pwdkQNtl6OiJG'
    // get input company
    const symbol = document.getElementById('searchInput').value;
    // create api
    const apiUrl = `http://127.0.0.1:8000/index/search?symbol=${symbol}&tokenF=${tokenF}&tokenP=${tokenP}`;
    // send api
    fetch(apiUrl)
        .then(response => response.json())
        // .then(data => console.log(data))
        .then(data => {
            record = data
            if (data.name === undefined) {
                displayError()
            } else {
                displayStockResult(data)
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayStockResult(data) {
    // clear container
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    // company
    const tab = document.createElement('div');
    tab.className = "buttonContainer";
    tab.innerHTML = `<button onclick="handleButtonClick('company')" id="company" class="clicked">Company</button>
                     <button onclick="handleButtonClick('stockSummary')" id="stockSummary">Stock Summary</button>
                     <button onclick="handleButtonClick('charts')" id="charts">Charts</button>
                     <button onclick="handleButtonClick('latestNews')" id="latestNews">Latest News</button>`
    resultElement = document.createElement('div');
    resultElement.innerHTML = `<img src=${data.logo}>
                               <p>Company Name: ${data.name}</p>
                               <p>Stock Ticker Symbol: ${data.ticker}</p>
                               <p>Stock Exchange Code: ${data.exchange}</p>
                               <p>Company Start Date: ${data.ipo}</p>
                               <p>Category: ${data.finnhubIndustry}</p>`;
    resultContainer.appendChild(tab);
    resultContainer.appendChild(resultElement);
}

function displayError() {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';
    const resultElement = document.createElement('div');
    resultElement.innerHTML = `<p>Error: No record has been found, please enter a valid symbol</p>`

    resultContainer.appendChild(resultElement);
}

function clearStock() {
    // 获取文本输入框元素
    const inputElement = document.getElementById('searchInput');

    // 将输入框的值设置为空字符串
    inputElement.value = '';
}

function handleButtonClick(buttonId) {
    // 移除所有按钮的clicked类
    document.querySelectorAll('.buttonContainer button').forEach(function (btn) {
        btn.classList.remove('clicked');
    });
    // 添加被点击按钮的clicked类
    document.getElementById(buttonId).classList.add('clicked');
    resultElement.innerHTML = '';
    if (buttonId === 'company') {
        resultElement.innerHTML = `<img src=${record.logo}>
                                   <p>Company Name: ${record.name}</p>
                                   <p>Stock Ticker Symbol: ${record.ticker}</p>
                                   <p>Stock Exchange Code: ${record.exchange}</p>
                                   <p>Company Start Date: ${record.ipo}</p>
                                   <p>Category: ${record.finnhubIndustry}</p>`;
    } else if (buttonId === 'stockSummary') {
        var img
        if (record.d >= 0) {
            img = '../static/img/GreenArrowUp.png'
        } else {
            img = '../static/img/RedArrowDown.png'
        }
        // strongSell, sell, hold, buy, strongBuy
        resultElement.innerHTML = `<p>Stock Ticker Symbol: ${record.ticker}</p>
                                   <p>Trading Day: ${convertUnixEpochToDateFormat(record.t / 1000)}</p>
                                   <p>Previous Closing Price: ${record.pc}</p>
                                   <p>Opening Price: ${record.o}</p>
                                   <p>High Price: ${record.h}</p>
                                   <p>Low Price: ${record.l}</p>
                                   <p>Change: ${record.d}<img src = ${img} width=2% height=2%></p>
                                   <p>Change Percent: ${record.dp}<img src = ${img} width=2% height=2%></p>
                                   <p>Strong Sell ${record.strongSell} ${record.sell} ${record.hold} ${record.buy} ${record.strongBuy} Strong Buy</p>
                                   <p>Recommendation Trends</p>`
    } else if (buttonId === 'charts') {
        (async () => {
            const ohlc = [],
                volume = [],
                dataLength = record.chartData.length;
            for (let i = 0; i < dataLength; i += 1) {
                ohlc.push([
                    record.chartData[i][0], // the date
                    record.chartData[i][1] // close
                ]);

                volume.push([
                    record.chartData[i][0], // the date
                    record.chartData[i][2] // the volume
                ]);
            }
            Highcharts.stockChart('chartContainer', {

                rangeSelector: {
                    selected: 1
                },

                title: {
                    text: `${record.ticker} Stock Price`
                },

                navigator: {
                    series: {
                        accessibility: {
                            exposeAsGroupOnly: true
                        }
                    }
                },
                yAxis: [{
                    title: {
                        text: 'Stock Price'
                    }
                }, {
                    opposite: true,
                    title: {
                        text: 'Volume'
                    }
                }],

                series: [{
                    name: `${record.ticker} Stock Price`,
                    data: ohlc,
                    type: 'area',
                    threshold: null,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }, {
                    type: 'column',
                    id: 'volume',
                    name: 'Volume',
                    data: volume,
                    yAxis: 1
                }]
            });
        })();

    } else if (buttonId === 'latestNews') {
        var html = ''
        for (var i = 0; i < record.latestNews.length; i++) {
            var news = record.latestNews[i];
            if (news.image === '') {
                news.image = record.logo
            }
            sub = `<div class="newsContainer">
                       <div class="newsImage">
                           <img src=${news.image} width=100px>
                       </div>
                       <div class="newsText">
                           <p>${news.headline}</p>
                           <p>${convertUnixEpochToDateFormat(news.datetime / 1000)}</p>
                           <p><a href="${news.url}">See Original Post</a></p>
                       </div>
                   </div>`
            html = html + sub
        }
        resultElement.innerHTML = `${html}`
    }
}

function convertUnixEpochToDateFormat(unixEpochTime) {
    // 创建一个 Date 对象，传入 Unix Epoch 时间（以毫秒为单位，因此需要乘以1000）
    const date = new Date(unixEpochTime * 1000);

    // 使用 Intl.DateTimeFormat 来获取格式化后的日期字符串
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-UK', options);
    const formattedDate = formatter.format(date);
    return formattedDate;
}