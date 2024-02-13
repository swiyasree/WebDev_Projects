document.addEventListener('DOMContentLoaded', function() 
{
    var stock_ticker;
    var hiddenContent = document.getElementById('hiddenContent');
    var companyStocks = document.getElementById('companystocks');
    var stockSummary = document.getElementById('stocksummary');
    var stockCharts = document.getElementById('stockCharts');
    var stockNews = document.getElementById('stockNews');
    var clearButton = document.getElementById('clear_text');

    function hideAll() {
        hiddenContent.style.display = 'none';
        companyStocks.style.display = 'none';
        stockSummary.style.display = 'none';
        stockCharts.style.display = 'none';
        stockNews.style.display = 'none';
    }

    function showCompanyStocks() {
        hideAll();
        hiddenContent.style.display = 'block';
        companyStocks.style.display = 'block';
    }

    function showStockSummary() {
        hideAll();
        hiddenContent.style.display = 'block';
        stockSummary.style.display = 'block';
    }

    function showStockCharts() {
        hideAll();
        hiddenContent.style.display = 'block';
        stockCharts.style.display = 'block';
    }

    function showStockNews() {
        hideAll();
        hiddenContent.style.display = 'block';
        stockNews.style.display = 'block';
    }

    document.getElementById('stockform').addEventListener('submit', function(event) {
        event.preventDefault();
        showCompanyStocks();
        stock_ticker = document.getElementById('stock_ticker').value;
        getStockTicker(stock_ticker);
    });

    clearButton.addEventListener('click', function() {
        event.preventDefault();
        var inputElement = document.getElementById('stock_ticker');
        inputElement.value = '';
    });

    document.getElementById("companydata").addEventListener("click", function(event) {
        event.preventDefault();
        showCompanyStocks();
        getStockTicker(stock_ticker);
    });

    document.getElementById("stockSummary").addEventListener("click", function(event) {
        event.preventDefault();
        showStockSummary();
        getStockSummary(stock_ticker);
    });

    document.getElementById("stockcharts").addEventListener("click", function(event) {
        event.preventDefault();
        showStockCharts();
        getStockCharts(stock_ticker);
    });

    document.getElementById("stocknews").addEventListener("click", function(event) {
        event.preventDefault();
        showStockNews();
        getStockNews(stock_ticker);
    });

    //  call python function 'get_stock_data()' with input stock ticker as an argument
    //  and call displayStockData() method with response as an argument.
    function getStockTicker(stock_ticker) 
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/get_stock_data?stock_ticker=' + encodeURIComponent(stock_ticker));
        xhr.onload = function() 
        {
            if (xhr.status === 200) 
            {
                var response = JSON.parse(xhr.responseText);
                if (response.error) 
                {
                    console.log("Error:", response.error); 
                    displayError(response.error);
                } 
                else 
                {
                    displayStockData(response);
                }
            } 
            else 
            {
                displayError('Failed to fetch stock data or invalid stock ticker');
            }
        };
        xhr.send();
    }

    // call python function 'get_stock_summary()' with input stock ticker as an argument
    // and call displayStockSummary() method with response as an argument
    function getStockSummary(stock_ticker) 
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/get_stock_summary?stock_ticker=' + encodeURIComponent(stock_ticker));
        xhr.onload = function() 
        {
            if (xhr.status === 200) 
            {
                var response = JSON.parse(xhr.responseText);
                if (response.error) 
                {
                    console.log("Error:", response.error); 
                    displayError(response.error);
                } 
                else 
                {
                    displayStockSummary(response);
                }
            } 
            else 
            {
                displayError('Failed to fetch stock data or invalid stock ticker');
            }
        };
        xhr.send();
    }

    //  call python function 'get_stock_charts()' with input stock ticker as an argument
    //  and call displayStockCharts() method with response as an argument.
    function getStockCharts(stock_ticker) 
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/get_stock_charts?stock_ticker=' + encodeURIComponent(stock_ticker));
        xhr.onload = function() {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);

                if (response.error) {
                    console.log("Error:", response.error); 
                    displayError(response.error);
                } else {
                    displayStockCharts(response);
                }
            } else {
                console.log('Error:', xhr.status, xhr.statusText); // Log any HTTP errors
                displayError('Failed to fetch stock data or invalid stock ticker');
            }
        };
        xhr.onerror = function() {
            console.log('Request failed'); // Log if the request failed
            displayError('Failed to send request');
        };
        xhr.send();
    }

    // call python function 'get_news()' with input stock ticker as an argument
    // and call displayStockNews() method with response as an argument
    function getStockNews(stock_ticker) 
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/get_news?stock_ticker=' + encodeURIComponent(stock_ticker));
        xhr.onload = function() 
        {
            if (xhr.status === 200) 
            {
                var response = JSON.parse(xhr.responseText);

                if (response.error) 
                {
                    console.log("Error:", response.error); 
                    displayError(response.error);
                } 
                else 
                {
                    displayStockNews(response);
                }
            } 
            else 
            {
                displayError('Failed to fetch stock data or invalid stock ticker');
            }
        };
        xhr.send();
    }

    // displays company stocks data 
    function displayStockData(data) {
        var stockInfo = document.getElementById('companystocks');
        stockInfo.innerHTML = '';
    
        // Create and append the logo image
        var logoImg = document.createElement('img');
        logoImg.src = data['Company Logo'];
        logoImg.alt = 'Company Logo';
        stockInfo.appendChild(logoImg);

        // Append a horizontal rule after each paragraph
        stockInfo.appendChild(document.createElement('hr'));
    
        // Create and append other data
        var keys = ['Company Name', 'Stock Ticker Symbol', 'Stock Exchange Code', 'Company Start Date', 'Category'];
        for (var i = 0; i < keys.length; i++) {
            var p = document.createElement('p');
            var strong = document.createElement('strong'); // Create strong element
            strong.textContent = keys[i] + ': '; // Set the key text content
            p.appendChild(strong); // Append the strong element to the paragraph
            p.textContent += data[keys[i]]; // Append the value to the paragraph
            stockInfo.appendChild(p);
    
            // Append a horizontal rule after each paragraph
            stockInfo.appendChild(document.createElement('hr'));
        }
    }
    
    
    // displays company stock summary data
    function displayStockSummary(data) 
    {
        var stockInfo = document.getElementById('stocksummary');
        stockInfo.innerHTML = '';

        stockInfo.appendChild(document.createElement('hr'));

        // Display only the latest recommendation trends
        var latestTrend = data.recommendation_trends[data.recommendation_trends.length - 1];
        var trendElement = document.createElement('p');
        trendElement.textContent = `Stock Ticker Symbol: ${latestTrend.symbol}`;
        stockInfo.appendChild(trendElement);

        stockInfo.appendChild(document.createElement('hr'));
    
        // Create and append other data
        var keys = ['Trading Day', 'Previous Closing Price', 'Opening Price', 'High Price', 'Low Price', 'Change', 'Change Percent'];
        for (var i = 0; i < keys.length; i++) {
            var p = document.createElement('p');
            var text = keys[i] + ': ' + data[keys[i]];
        
            // Check if the key is "Change" or "Change Percent"
            if (keys[i] === 'Change' || keys[i] === 'Change Percent') {
                var img = document.createElement('img');
                img.src = data[keys[i]] < 0 ? '../static/img/RedArrowDown.png' : '../static/img/GreenArrowUp.png';
                img.style.paddingLeft = '10px';
                img.style.width = '15px';
                img.style.height = '15px';
        
                // Create a container div for text and image
                var container = document.createElement('div');
                container.style.display = 'inline-block'; // Ensure text and image appear in the same line
                container.appendChild(document.createTextNode(text));
                container.appendChild(img);
        
                // Append container to stockInfo
                stockInfo.appendChild(container);
            } else {
                p.textContent = text;
                stockInfo.appendChild(p);
            }
        
            stockInfo.appendChild(document.createElement('hr'));
        }        
    
        // Get the latest trend data
        var latestTrend = data.recommendation_trends[data.recommendation_trends.length - 1];

        // Define an array of trend values and their corresponding colors
        // Define an array of trend values and their corresponding colors
        var trendValues = [
            { label: 'Strong Sell', color: '#ed2937' },
            { label: latestTrend.strongSell, color: '#ed2937' },
            { label: latestTrend.sell, color: '#b25f4a' },
            { label: latestTrend.hold, color: '#77945c' },
            { label: latestTrend.buy, color: '#3cca6c' },
            { label: latestTrend.strongBuy, color: '#02ff7f' },
            { label: 'Strong Buy', color: '#02ff7f' }
        ];

        var spacer = document.createElement('div');
        spacer.style.paddingTop = '20px'; // Adjust the top margin as needed

        // Append the spacer element to the stockInfo container
        stockInfo.appendChild(spacer);

        // Loop through each trend value and create a box for it
        trendValues.forEach(function(trend, index) {
            // Create a span element for the trend value
            var trendBox = document.createElement('span');

            // Set text content to the trend label
            trendBox.textContent = trend.label;

            // Apply styling for the trend box
            trendBox.style.backgroundColor = index === 0 || index === trendValues.length - 1 ? 'white' : trend.color;
            trendBox.style.color = index === 0 ? '#ed2937' : index === trendValues.length - 1 ? '#02ff7f' : 'white';
            trendBox.style.fontWeight = 'bold';
            trendBox.style.padding = '15px';

            // Append the trend box to the stockInfo element
            stockInfo.appendChild(trendBox);
        });

        var rectrends = document.createElement('h4');
        rectrends.textContent = data['rectrends'];
        stockInfo.appendChild(rectrends);
    }

    function displayStockCharts(data) {
        // Check if data is empty or undefined
        if (!data || !data['Date'] || !data['Stock Price'] || !data['Volume'] || data['Date'].length === 0) {
            displayError('----No stock chart data available-----');
            return;
        }
    
        // Extracting data from the response
        var dates = data['Date'].map(function(timestamp) {
            return new Date(timestamp).getTime();
        });
        var prices = data['Stock Price'];
        var volumes = data['Volume'];
    
        // Constructing data series for HighCharts
        var stockPriceData = dates.map(function(date, index) {
            return [date, prices[index]];
        });
    
        var volumeData = dates.map(function(date, index) {
            return [date, volumes[index]];
        });
    
        // Display HighCharts code
        Highcharts.stockChart('stockCharts', {
            rangeSelector: {
                buttons: [{
                    type: 'all',
                    text: 'All'
                }, {
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected: 0 // Index of the button to be selected by default
            },            
            title: {
                text: 'Stock Price ' + data['Ticker'] + ' (' + getTodayDate() + ')'
            },
            subtitle: {
                text: 'Source: <a href="https://polygon.io/">Polygon.io</a>',
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: [{
                title: {
                    text: 'Stock Price'
                },
                labels: {
                    format: '{value:.2f}'
                },
                tickPositions: [180, 200, 220, 240, 260, 280], // Set custom tick positions for stock price
                opposite: false // Align this yAxis on the left
            }, {
                title: {
                    text: 'Volume'
                },
                labels: {
                    formatter: function () {
                        switch (this.value) {
                            case 0:
                                return '0';
                            case 80000000:
                                return '80M';
                            case 160000000:
                                return '160M';
                            case 240000000:
                                return '240M';
                            case 320000000:
                                return '320M';
                            case 400000000:
                                return '400M';
                            default:
                                return '';
                        }
                    }
                },
                tickPositions: [0, 80000000, 160000000, 240000000, 320000000,400000000], // Volume tick positions in millions
                opposite: true // Align this yAxis on the right
            }],            
            series: [{
                name: 'Stock Price',
                type: 'area',
                color: '#1e90ff', // Adjust the color of the stock price line
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
                },
                data: stockPriceData,
                tooltip: {
                    valueDecimals: 2
                }
            }, {
                name: 'Volume',
                type: 'column',
                color: 'black', // Change the color of the volume bars to black
                fillColor: 'black', // Fill the volume bars with black color
                yAxis: 1, // Use the second yAxis for this series
                data: volumeData,
                tooltip: {
                    valueDecimals: 0
                },
                pointWidth: 4
            }]
        });
    }
    
    function getTodayDate() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();
        return yyyy + '-' + mm + '-' + dd;
    }    
    

    // displays company stock news data
    function displayStockNews(data) 
    {
        var stockInfo = document.getElementById('stockNews');
        stockInfo.innerHTML = '';
    
        // Iterate through the data array
        data.forEach(function(article) {
            // Create a div element for each article
            var card = document.createElement('div');
            card.classList.add('card');
    
            // Add the article image if available
            if (article['Image']) {
                var image = document.createElement('img');
                image.src = article['Image'];
                card.appendChild(image);
            }
    
            // Create a div for the text content
            var cardText = document.createElement('div');
            cardText.classList.add('card-text');
    
            // Add the article title
            var title = document.createElement('h3');
            title.textContent = article['Title'];
            cardText.appendChild(title);
    
            // Add the article date
            var date = document.createElement('p');
            date.textContent = article['Date'];
            cardText.appendChild(date);
    
            // Add a link to the original post
            var link = document.createElement('a');
            link.href = article['Link to Original Post'];
            link.textContent = 'See Original Post';
            link.target = '_blank'; // Open in a new tab
            cardText.appendChild(link);
    
            // Append the card text content to the card
            card.appendChild(cardText);
    
            // Append the card to the stockInfo element
            stockInfo.appendChild(card);
        });
    }
    
    // display error message if anything fails
    function displayError(errorMsg) 
    {
        var stockInfo = document.getElementById('companystocks');
        stockInfo.innerHTML = '';

        var errorText = document.createElement('p');
        errorText.textContent = errorMsg;
        stockInfo.appendChild(errorText);
    }
});
