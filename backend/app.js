// console.log("i")
const express = require('express');
const axios = require('axios');
const cors = require('cors');



const app = express();
const port = 3000;
const KEY = "#######"; //key removed from github repo
app.use(cors());


app.get('/favicon.ico', (req, res) => res.status(204));
app.get('/', (req, res) => {
    return res.send('Root on localhost');
});

const autocomplete_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${KEY}`);
        // console.log(resp.data['result']);
        return resp.data['result'];
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};


app.get('/autocomplete/:query', async function (req, res) {

    let result = await autocomplete_api(req.params.query,KEY);
    // console.log(result);
    return res.send(result);

});



const company_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${query}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};


app.get('/company/:query', async function (req, res) {

    let result = await company_api(req.params.query,KEY);
    // console.log(result);
    return res.send(result);
    
});

const summaryhistoricaldata_api = async (query,resolution,fromdate,todate,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${query}&resolution=${resolution}&from=${fromdate}&to=${todate}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};

app.get('/summaryhistoricaldata/:query/:todate', async function (req, res) {

    let resolution = 5;
    let todate = req.params.todate;
    // console.log(todate)
    let fromdate = todate-21600;
    // console.log(fromdate) 
    let result = await summaryhistoricaldata_api(req.params.query, resolution,fromdate, todate, KEY);
    // console.log(result);
    return res.send(result);
    // if (origRes)
    //     return res.status(200).json(origRes);
});

const historicaldata_api = async (query,resolution,fromdate,todate,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${query}&resolution=${resolution}&from=${fromdate}&to=${todate}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};

app.get('/historicaldata/:query', async function (req, res) {
   
    let resolution = 'D';
    var crtTime = new Date()
    var todate = Math.round((crtTime).getTime() / 1000);
    // console.log(todate)
    let fromdate =  Math.round(crtTime.setFullYear((crtTime.getFullYear() - 2))/1000)
    // console.log(fromdate)
    let result = await historicaldata_api(req.params.query, resolution,fromdate, todate, KEY);
    // console.log(result);
    return res.send(result);
    // if (origRes)
    //     return res.status(200).json(origRes);
});



const price_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${query}&token=${KEY}`);
        //console.log(resp.data)
        let obj = resp.data;
        obj['ticker'] = query;
        return obj;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};


app.get('/price/:query', async function (req, res) {
    // console.log(`\nSearch-utilities Call: ${req.params.query}`);
    // if not found, response is [] with length 0
    let result = await price_api(req.params.query, KEY);
    // console.log(result);
    return res.send(result);
    // if (origRes)
    //     return res.status(200).json(origRes);
});



const news_api = async (query,fromdate,todate,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${query}&from=${fromdate}&to=${todate}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};


app.get('/news/:query', async function (req, res) {
    var crtTime = new Date()
    var todate = Math.round((crtTime).getTime() / 1000);
    let fromdate =  Math.round(crtTime.setMonth((crtTime.getMonth() - 6))/1000);
    // console.log(fromdate,todate)
    var date = new Date(fromdate * 1000);
    var fdate = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
    var newdate =new Date(todate * 1000);
    var tdate = newdate.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);

    let result = await news_api(req.params.query, fdate, tdate, KEY);
    return res.send(result);
});



const recommendation_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${query}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};


app.get('/recommendation/:query', async function (req, res) {
    // console.log(`\nSearch-utilities Call: ${req.params.query}`);
    // if not found, response is [] with length 0
    let result = await recommendation_api(req.params.query, KEY);
    // console.log(result);
    return res.send(result);
    // if (origRes)
    //     return res.status(200).json(origRes);
});


const sentiment_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/social-sentiment?symbol=${query}&from=2022-01-01&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};

app.get('/sentiment/:query', async function (req, res) {
    // console.log(`\nSearch-utilities Call: ${req.params.query}`);
    // if not found, response is [] with length 0
    let result = await sentiment_api(req.params.query, KEY);
    // console.log(result);
    return res.send(result);
    // if (origRes)
    //     return res.status(200).json(origRes);
});


const peer_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${query}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};

app.get('/peer/:query', async function (req, res) {
    // console.log(`\nSearch-utilities Call: ${req.params.query}`);
    // if not found, response is [] with length 0
    let result = await peer_api(req.params.query, KEY);
    // console.log(result);
    return res.send(result);
    // if (origRes)
    //     return res.status(200).json(origRes);
});

const earnings_api = async (query,KEY) => {
    try {
        const resp = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${query}&token=${KEY}`);
        //console.log(resp.data)
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.log(err);
    }
};

app.get('/earnings/:query', async function (req, res) {
    // console.log(`\nSearch-utilities Call: ${req.params.query}`);
    // if not found, response is [] with length 0
    let result = await earnings_api(req.params.query, KEY);
    // console.log(result);
    return res.send(result);

});

app.listen(process.env.PORT || 3000, ()=>{
    console.log('server is running');
})