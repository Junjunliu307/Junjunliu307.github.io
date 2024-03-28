const express = require('express');
const app = express();
const PORT = 8000;
const finnhub = require('finnhub');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://junjunliu307:DYGlpfEkzhKxtxXj@cluster0.icrv0bq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const moneyId = new ObjectId('65fbf21b6a0ac27aa1b3746e');
const watchlistId = new ObjectId('65fc75512c7bfc52b5721eaa');
const portfolioId = new ObjectId('65fc63331640e08dff2f7977');


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
        console.log(__dirname)
        await client.connect();
    } catch (error) {
        console.error('Error connecting to database:', error);
    }

}
connectToDatabase();

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/search', async (req, res) => {
    try {
        const sym = req.query.symbol
        const tokenF = req.query.tokenF
        const tokenP = req.query.tokenP
        const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        api_key.apiKey = tokenF // Replace this
        const finnhubClient = new finnhub.DefaultApi()
        const currentDate = new Date()
        const promise = new Promise((resolve, reject) => {
            let stockData = {};
            const profilePromise = new Promise((resolve, reject) => {
                axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${tokenF}`)
                    .then(response => {
                        stockData = { ...stockData, ...response.data };
                        resolve();
                    })
            });

            const quotePromise = new Promise((resolve, reject) => {
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${tokenF}`)
                    .then(response => {
                        stockData = { ...stockData, ...response.data };
                        resolve();
                    })
            });

            const peersPromise = new Promise((resolve, reject) => {
                axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${sym}&token=${tokenF}`)
                    .then(response => {
                        stockData = { ...stockData, 'peers': response.data };
                        resolve();
                    })
            });

            const newsPromise = new Promise((resolve, reject) => {
                finnhubClient.companyNews(sym, new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('af'), currentDate.toLocaleDateString('af'), (error, data, response) => {
                    data = data.filter(element => element.image !== "" && element.url !== "" && element.headline !== "");
                    stockData = { ...stockData, 'latestNews': data.length <= 20 ? data : data.slice(0, 20) }; resolve();
                });
            });

            const insiderSentimentPromise = new Promise((resolve, reject) => {
                axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${sym}&from=2022-01-01 &token=${tokenF}`)
                    .then(response => {
                        stockData = { ...stockData, 'insiderSentiment': response.data };
                        resolve();
                    })
                // finnhubClient.insiderSentiment(sym, '2021-01-01', currentDate.toLocaleDateString('af'), (error, data, response) => {
                //     stockData = { ...stockData, 'insiderSentiment': data }; resolve();
                // });
            });

            const recommendationTrendsPromise = new Promise((resolve, reject) => {
                finnhubClient.recommendationTrends(sym, (error, data, response) => {
                    stockData = { ...stockData, 'recommendationData': data }; resolve();
                });
            });

            const earningsPromise = new Promise((resolve, reject) => {
                finnhubClient.companyEarnings(sym, { 'limit': 4 }, (error, data, response) => {
                    stockData = { ...stockData, 'earnings': data }; resolve();
                });
            });

            const chartDataPromise = new Promise((resolve, reject) => {
                axios.get(`https://api.polygon.io/v2/aggs/ticker/${sym}/range/1/day/${new Date(currentDate.getTime() - 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('af')}/${currentDate.toLocaleDateString('af')}?adjusted=true&sort=asc&apiKey=${tokenP}`)
                    .then(response => {
                        response.data.results = response.data.results ? response.data.results.map(item => {
                            return [item.t, item.o, item.h, item.l, item.c, item.v];
                        }) : [];
                        stockData = { ...stockData, 'chartData': response.data.results };
                        resolve();
                    })
            });

            const hourlyDataPromise = new Promise((resolve, reject) => {
                axios.get(`https://api.polygon.io/v2/aggs/ticker/${sym}/range/1/hour/${new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('af')}/${currentDate.toLocaleDateString('af')}?adjusted=true&sort=asc&apiKey=${tokenP}`)
                    .then(response => {
                        response.data.results = response.data.results ? response.data.results.map(item => {
                            return [item.t, item.c];
                        }) : [];
                        stockData = { ...stockData, 'hourlyData': response.data.results };
                        resolve();
                    })
            });

            Promise.all([profilePromise, quotePromise, peersPromise, newsPromise, insiderSentimentPromise, recommendationTrendsPromise, earningsPromise, chartDataPromise, hourlyDataPromise])
                .then(() => {
                    resolve(stockData);
                })
        })
        const [data] = await Promise.all([promise]);
        res.json(data);
    } catch (error) {
        console.error('Error processing search request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/autoComplete', async (req, res) => {
    try {
        const queryName = req.query.q
        const tokenF = req.query.tokenF
        axios.get(`https://finnhub.io/api/v1/search?q=${queryName}&token=${tokenF}`)
            .then(response => {
                res.json(response.data)
            })
    } catch (error) {
        console.error('Error processing autoComplete request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/makeDeal', async (req, res) => {

    try {
        const sym = req.query.symbol
        const num = parseInt(req.query.num)
        const price = parseFloat(req.query.price)
        const collection = client.db('user_data').collection('junjunliu')
        const portfolioData = await collection.findOne({ _id: portfolioId });
        const moneyData = await collection.findOne({ _id: moneyId });
        if (sym in portfolioData.portfolio) {
            const history = portfolioData.portfolio[`${sym}`]
            if (num > 0) {
                await collection.updateOne({ _id: portfolioId }, { $set: { [`portfolio.${sym}`]: [...history, ...new Array(num).fill(price)] } });
            } else {
                if (history.length + num === 0) {
                    await collection.updateOne({ _id: portfolioId }, { $unset: { [`portfolio.${sym}`]: 1 } });
                } else {
                    await collection.updateOne({ _id: portfolioId }, { $set: { [`portfolio.${sym}`]: history.slice(-num) } });
                }
            }
        } else {
            await collection.updateOne({ _id: portfolioId }, { $set: { [`portfolio.${sym}`]: new Array(num).fill(price) } });
        }
        await collection.updateOne({ _id: moneyId }, { $set: { 'money': moneyData.money - price * num } });
        const acountOverview = await collection.find({}).toArray()
        res.json({ money: acountOverview[0].money, portfolio: acountOverview[1].portfolio, watchlist: acountOverview[2].watchlist })
    } catch (error) {
        console.error('Error processing changeStockNumber request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/handleWatchList', async (req, res) => {
    const sym = req.query.symbol
    const collection = client.db('user_data').collection('junjunliu')
    const watchlistData = await collection.findOne({ _id: watchlistId });
    if (watchlistData.watchlist.includes(sym)) {
        await collection.updateOne({ _id: watchlistId }, { $pull: { [`watchlist`]: sym } });
    } else {
        await collection.updateOne({ _id: watchlistId }, { $push: { [`watchlist`]: sym } });
    }
    const acountOverview = await collection.find({}).toArray()
    res.json({ money: acountOverview[0].money, portfolio: acountOverview[1].portfolio, watchlist: acountOverview[2].watchlist })
})

app.get('/queryUserData', async (req, res) => {
    try {
        const collection = client.db('user_data').collection('junjunliu')
        const acountOverview = await collection.find({}).toArray()
        res.json({ money: acountOverview[0].money, portfolio: acountOverview[1].portfolio, watchlist: acountOverview[2].watchlist })
    } catch (error) {
        console.error('Error processing queryUserData request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/resetUser', async (req, res) => {
    try {
        const database = client.db('user_data');
        const collection = database.collection('junjunliu');
        await collection.updateOne({ _id: moneyId }, { $set: { [`money`]: 25000 } });
        await collection.updateOne({ _id: watchlistId }, { $set: { [`watchlist`]: [] } });
        await collection.updateOne({ _id: portfolioId }, { $set: { [`portfolio`]: {} } });
        const acountOverview = await collection.find({}).toArray()
        res.json({ money: acountOverview[0].money, portfolio: acountOverview[1].portfolio, watchlist: acountOverview[2].watchlist })
    } catch (error) {
        console.error('Error processing resetUser request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/queryStock', async (req, res) => {
    try {
        const sym = req.query.symbol
        const tokenF = req.query.tokenF
        const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        api_key.apiKey = tokenF // Replace this
        const promise = new Promise((resolve, reject) => {
            let stockData = {};
            const profilePromise = new Promise((resolve, reject) => {
                axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${tokenF}`)
                    .then(response => {
                        stockData = { ...stockData, ...response.data };
                        resolve();
                    })
            });

            const quotePromise = new Promise((resolve, reject) => {
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${tokenF}`)
                    .then(response => {
                        stockData = { ...stockData, ...response.data };
                        resolve();
                    })
            });

            Promise.all([profilePromise, quotePromise])
                .then(() => {
                    resolve(stockData);
                })
        })
        const [data] = await Promise.all([promise]);
        res.json(data);
    } catch (error) {
        console.error('Error processing resetUser request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
});

