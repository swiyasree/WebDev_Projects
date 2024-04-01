var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var cors = require('cors');
var axios = require('axios');
const { ObjectId } = require('mongodb');
const moment = require('moment');

const hApi = '7dEn5T3jjmb21Ef1NDWKedyMsaycmj4Z';
const fApi = 'cn18egpr01qvjam1s380cn18egpr01qvjam1s38g';
let lastTickerValue = '';
let lastTimeStamp = null;

const app = express();
app.use(cors());

var CONNECTION_STRING = "mongodb+srv://brundaminampally:2136919183@sree.dpmn3m3.mongodb.net/?retryWrites=true&w=majority&appName=Sree";
var DatabaseName = "Stock_data";
var database;

app.use(bodyParser.json()); 

app.listen(5172, () => {
  MongoClient.connect(CONNECTION_STRING, (error, client) => {
    if (error) {
      console.error("Error connecting to MongoDB:", error);
      return;
    }
    database = client.db(DatabaseName);
    console.log("Successful connection to MongoDB");
  });
});

app.get('/autocomplete', async (request, response) => 
{
  const { input } = request.query;
  try 
  {
    const autocompleteResponse = await axios.get(`https://finnhub.io/api/v1/search?q=${input}&token=${fApi}`);
    const autocompleteOptions = autocompleteResponse.data;
    response.json(autocompleteOptions);
  } 
  catch (error) 
  {
    console.error("Error fetching autocomplete options:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

app.get('/search', async (request, response) => {
  const { ticker } = request.query;

  // If ticker value is provided, update the lastTickerValue
  if (ticker) {
    lastTickerValue = ticker;
  }

  // Use the lastTickerValue to call the Finnhub API
  try {
    const quoteResponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${lastTickerValue}&token=${fApi}`);
    const quoteData = quoteResponse.data;

    const profileResponse = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${lastTickerValue}&token=${fApi}`);
    const profileData = profileResponse.data;

    lastTimeStamp = (quoteData.t * 1000);

    // Filtered data from the two APIs
    const filteredProfileData = {
      symbol: profileData.ticker,
      company_name: profileData.name,
      exchange: profileData.exchange,
      logo: profileData.logo,
      ipo: profileData.ipo,
      ind: profileData.finnhubIndustry,
      webpage: profileData.weburl
    };

    const filteredQuoteData = {
      last_price: quoteData.c,
      change: quoteData.d,
      percent_change: quoteData.dp,
      timestamp: quoteData.t,
      highprice: quoteData.h,
      lowprice: quoteData.l,
      openprice: quoteData.o,
      closeprice: quoteData.c,
      prevprice: quoteData.pc
    };

    // Combine data from the two APIs
    const combinedData = {
      profile_data: filteredProfileData,
      quote_data: filteredQuoteData
    };

    console.log('combined data in backend', combinedData);

    response.json(combinedData);
  } catch (error) {
    console.error("Error fetching data from Finnhub API:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

app.get('/summary', async (request, response) => {
  const { ticker } = request.query;

  try 
  {
    const toDate = moment(lastTimeStamp).valueOf();
    const fromDate = moment(toDate).subtract(24, 'hours').valueOf();

    const multiplier = "1";
    const timespan = "hour";

    console.log('todate: ', toDate, 'from: ', fromDate);
    // Fetch HPV data
    const HPResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=5000&apiKey=${hApi}`);
    const HPData = HPResponse.data;

    console.log('hpdata: ', HPData);

    // Fetch peers data
    const peersResponse = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${fApi}`);
    const peersData = peersResponse.data;


    // Organize summary data
    const summaryData = {
      peers: peersData,
      hourlyPrices: HPData.results
    };

    response.json(summaryData);
  } catch (error) {
    console.error("Error fetching summary data:", error);
    response.status(500).json({ error: "Internal server error" });
  }

});

app.get('/topnews', async (request, response) => {
  const { ticker } = request.query;

  // Calculate today's date in YYYY-MM-DD format
  const today = new Date();
  const toYear = today.getFullYear();
  const toMonth = String(today.getMonth() + 1).padStart(2, '0'); // January is 0, so we add 1
  const toDate = String(today.getDate()).padStart(2, '0');
  const toDateFormatted = `${toYear}-${toMonth}-${toDate}`;

  // Calculate 30 days ago from today
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const fromYear = thirtyDaysAgo.getFullYear();
  const fromMonth = String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0'); // January is 0, so we add 1
  const fromDate = String(thirtyDaysAgo.getDate()).padStart(2, '0');
  const fromDateFormatted = `${fromYear}-${fromMonth}-${fromDate}`;

  try {
    // Fetch top news data
    const topNewsResponse = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDateFormatted}&to=${toDateFormatted}&token=${fApi}`);
    const topNewsData = topNewsResponse.data;

    // Limit to the first 10 news items
    const formattedNews = topNewsData.slice(0, 10).map(newsItem => ({
      datetime: newsItem.datetime,
      headline: newsItem.headline,
      thumbnail: newsItem.image,
      source: newsItem.source,
      summary: newsItem.summary,
      url: newsItem.url
    }));

    response.json(formattedNews);
  } catch (error) {
    console.error("Error fetching top news data:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

app.get('/charts', async (request, response) => {
  const { ticker } = request.query;

  try {
    const toDate = moment().format('YYYY-MM-DD'); // Current date
    const fromDate = moment(toDate).subtract(12, 'months').format('YYYY-MM-DD'); // 6 months before toDate
    const multiplier = "1";
    const timespan = "day";

    const chartsURL = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${hApi}`;

    const chartsResponse = await axios.get(chartsURL);
    const chartsData = chartsResponse.data;

    response.json(chartsData.results);
  } 
  catch (error) 
  {
    console.error('Error:', error);
  }
});

app.get('/insights', async (request, response) => {
  const { ticker } = request.query;

  try 
  {
    // Fetch insider sentiment data
    const insiderSentimentResponse = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${fApi}`);
    const insiderSentimentData = insiderSentimentResponse.data;

    // Fetch trends data
    const trendsResponse = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${fApi}`);
    const trendsData = trendsResponse.data;

    // Fetch historical data
    const historicalResponse = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${fApi}`);
    const historicalData = historicalResponse.data;

    // Take the recent four months' data
    const currentDate = new Date();
    const recentFourMonthsData = trendsData.filter(monthData => {
      const periodDate = new Date(monthData.period);
      return currentDate.getMonth() - periodDate.getMonth() < 4;
    });

    // Extract specific data from the recent four months' trends data
    const filteredTrendsData = recentFourMonthsData.map(monthData => ({
      period: monthData.period,
      strong_buy: monthData.strongBuy,
      buy: monthData.buy,
      hold: monthData.hold,
      sell: monthData.sell,
      strong_sell: monthData.strongSell
    }));

    // Parse insider sentiment data
    let totalMSPR = 0;
    let positiveMSPR = 0;
    let negativeMSPR = 0;
    let totalChange = 0;
    let positiveChange = 0;
    let negativeChange = 0;

    insiderSentimentData.data.forEach(entry => {
      totalMSPR += entry.mspr;
      totalChange += entry.change;
      if (entry.mspr > 0) {
        positiveMSPR += entry.mspr;
      } else if (entry.mspr < 0) {
        negativeMSPR += entry.mspr;
      }
      if (entry.change > 0) {
        positiveChange += entry.change;
      } else if (entry.change < 0) {
        negativeChange += entry.change;
      }
    });

    // Organize insights data
    const insightsData = {
      Total_MSPR: totalMSPR,
      Positive_MSPR: positiveMSPR,
      Negative_MSPR: negativeMSPR,
      Total_Change: totalChange,
      Positive_Change: positiveChange,
      Negative_Change: negativeChange
    };

    // Combine insights data with filtered trends data
    const combinedData = {
      ...insightsData,
      Recent_Four_Months_Trends: filteredTrendsData,
      HistoricalData: historicalData
    };

    response.json(combinedData);
  } 
  catch (error) 
  {
    console.error("Error fetching insights data:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

app.post('/watchlist', (request, response) => 
{
  const summaryData = request.body;

  database.collection("Watchlist").insertOne(summaryData, (error, result) => 
  {
    if (error) 
    {
      console.error("Error inserting data into MongoDB:", error);
      response.status(500).json({ error: "Internal server error" });
      return;
    }
    
    response.json({ message: "Data inserted into MongoDB successfully" });
  });
});

app.get('/watchlist', async (request, response) => {

  try {
    const watchlistData = await database.collection("Watchlist").find({}).toArray();

    // Send the watchlist data as the response
    response.json(watchlistData);

  } catch (error) {
    console.error("Error fetching watchlist data from MongoDB:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

app.delete('/watchlist/:id', async (request, response) => {
  const id = request.params.id;
  
  try {
    // Convert the string id to ObjectId
    const objectId = new ObjectId(id);

    // Remove the entry from MongoDB based on the provided id
    const result = await database.collection("Watchlist").deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      // If no document was deleted, it means the id provided does not exist
      response.status(404).json({ error: "Entry not found" });
      return;
    }

    response.json({ message: "Entry removed successfully" });
  } catch (error) {
    console.error("Error removing entry from MongoDB:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

app.get('/currentBalance', async (req, res) => {
  try 
  {
    // Assuming your collection is named "CurrentBalance"
    const currentBalance = await database.collection("CurrentBalance").findOne();

    res.json(currentBalance);
  } 
  catch (error) 
  {
    console.error("Error fetching current balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/portfolio', async (req, res) => {
  try {
    const { company, quantity, total, totalPrice, avgPrice, currentPrice, marketPrice, symbol } = req.body;
    
    // Update the user's portfolio
    await database.collection("Portfolio").updateOne(
      { symbol: symbol }, // Filter criteria
      { 
        $set: { 
          company: company, // Update company field using $set operator
          avgPrice: avgPrice,
          currentPrice: currentPrice
        },
        $inc: { 
          marketPrice, marketPrice,
          quantity: quantity, // Increment quantity by the given value
          totalPrice: totalPrice, // Increment totalPrice by the given value
          change: avgPrice - req.body.currentPrice // Calculate change and set it
        }
      },
      { upsert: true } // Options: create a new document if the symbol doesn't exist
    );

    // Update the current balance directly without any checks
    await database.collection("CurrentBalance").updateOne({}, { $inc: { currentAmount: total } });

    res.json({ message: "Portfolio updated successfully" });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/portfolio', async (req, res) => {
  try {
    // Fetch portfolio data from the database
    const portfolioData = await database.collection("Portfolio").find({}).toArray();
    // Send the portfolio data as the response
    res.json(portfolioData);
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



