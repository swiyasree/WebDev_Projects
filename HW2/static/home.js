document.addEventListener('DOMContentLoaded', function() 
{
    var stock_ticker;
    var hiddenContent = document.getElementById('hiddenContent');
    var companyStocks = document.getElementById('companystocks');
    var stockSummary = document.getElementById('stocksummary');
    var stockCharts = document.getElementById('stockCharts');
    var stockNews = document.getElementById('stockNews');
    var clearButton = document.getElementById('clear_text');
    var links = document.querySelectorAll('div ul li a');

    links.forEach(function(link) 
    {
        link.addEventListener('click', function() 
        {
            links.forEach(function(l) 
            {
                l.classList.remove('linkactive');
            });
            link.classList.add('linkactive');
        });
    });

    function hideAll() 
    {
        hiddenContent.style.display = 'none';
        companyStocks.style.display = 'none';
        stockSummary.style.display = 'none';
        stockCharts.style.display = 'none';
        stockNews.style.display = 'none';
    }

    function showCompanyStocks() 
    {
        hideAll();
        hiddenContent.style.display = 'block';
        companyStocks.style.display = 'block';
    }

    function showStockSummary() 
    {
        hideAll();
        hiddenContent.style.display = 'block';
        stockSummary.style.display = 'block';
    }

    function showStockCharts() 
    {
        hideAll();
        hiddenContent.style.display = 'block';
        stockCharts.style.display = 'block';
    }

    function showStockNews() 
    {
        hideAll();
        hiddenContent.style.display = 'block';
        stockNews.style.display = 'block';
    }

    function clearPreviousSearchResults() 
    {
        var errorMessage = document.querySelector('.error-message');
        if (errorMessage) 
        {
            errorMessage.remove();
        }
        hideAll();
    }   
    
    function clearError() 
    {
        var errorMessage = document.querySelector('.error-message');
        if (errorMessage) 
        {
            errorMessage.remove();
        }
    }
       
    document.getElementById('stockform').addEventListener('submit', function(event) 
    {
        event.preventDefault();
        stock_ticker = document.getElementById('stock_ticker').value;
        getStockTicker(stock_ticker);

        links.forEach(function(l) 
        {
            l.classList.remove('linkactive');
        });
        document.getElementById("companydata").classList.add('linkactive');
    });

    clearButton.addEventListener('click', function(event) 
    {
        event.preventDefault();
        var inputElement = document.getElementById('stock_ticker');
        inputElement.value = '';
        clearPreviousSearchResults();
    });

    document.getElementById("companydata").addEventListener("click", function(event) 
    {
        event.preventDefault();
        showCompanyStocks();
        getStockTicker(stock_ticker);
    });

    document.getElementById("stockSummary").addEventListener("click", function(event) 
    {
        event.preventDefault();
        showStockSummary();
        getStockSummary(stock_ticker);
    });

    document.getElementById("stockcharts").addEventListener("click", function(event) 
    {
        event.preventDefault();
        showStockCharts();
        getStockCharts(stock_ticker);
    });

    document.getElementById("stocknews").addEventListener("click", function(event) 
    {
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
        xhr.onload = function () 
        {
            if (xhr.status === 200) 
            {
                var response = JSON.parse(xhr.responseText);
                if (response.error || !response) 
                {
                    displayError(response.error);
                    document.querySelector('.content-display').style.display = 'none';
                } 
                else 
                {
                    if ('logo' in response && 'name' in response && 'ticker' in response && 'exchange' in response && 'ipo' in response && 'finnhubIndustry' in response)
                    {
                        var new_response = 
                        {
                            "Company Logo": response.logo,
                            "Company Name": response.name,
                            "Stock Ticker Symbol": response.ticker,
                            "Stock Exchange Code": response.exchange,
                            "Company Start Date": response.ipo,
                            "Category": response.finnhubIndustry
                        };
                        console.log("in else 1 to not display error and parse");
                        clearError();
                        document.querySelector('.content-display').style.display = 'block';
                        showCompanyStocks();
                        displayStockData(new_response);
                    }
                    
                    else 
                    {
                        displayError('Error: No record has been found, please enter a valid symbol');
                    }
                    
                }
            } 
            else 
            {
                displayError('Error: No record has been found, please enter a valid symbol');
                document.querySelector('.content-display').style.display = 'none';
            }
        };

        xhr.onerror = function() 
        {
            displayError('Failed to send request');
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
                    displayError(response.error);
                } 
                else 
                {
                    var ss_data = response.ss_data;
                    var rt_data = response.rt_data;
    
                    // Parse ss_data if needed
                    var new_ss_data = 
                    {
                        "Trading Day": ss_data.t,
                        "Previous Closing Price": ss_data.pc,
                        "Opening Price": ss_data.o,
                        "High Price": ss_data.h,
                        "Low Price": ss_data.l,
                        "Change": ss_data.d,
                        "Change Percent": ss_data.dp,
                        "recommendation_trends": [],
                        "rectrends": "Recommendation Trends"
                    };
    
                    // Parse rt_data
                    rt_data.forEach(function(trend) 
                    {
                        new_ss_data.recommendation_trends.push({
                            "symbol": trend.symbol,
                            "period": trend.period,
                            "strongSell": trend.strongSell,
                            "sell": trend.sell,
                            "hold": trend.hold,
                            "buy": trend.buy,
                            "strongBuy": trend.strongBuy
                        });
                    });
    
                    displayStockSummary(new_ss_data);
                }
            } 
            else 
            {
                displayError('Error: No record has been found, please enter a valid symbol');
            }
        };
        
        xhr.onerror = function() 
        {
            displayError('Failed to send request');
        };

        xhr.send();
    }    

    //  call python function 'get_stock_charts()' with input stock ticker as an argument
    //  and call displayStockCharts() method with response as an argument.
    function getStockCharts(stock_ticker) 
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/get_stock_charts?stock_ticker=' + encodeURIComponent(stock_ticker));
        xhr.onload = function() 
        {
            if (xhr.status === 200) 
            {
                var response = JSON.parse(xhr.responseText);
    
                if (response.error) 
                {
                    displayError(response.error);
                } 
                else 
                {
                    // Extracting necessary fields from the response
                    var data = response.results;
                    var dates = [];
                    var prices = [];
                    var volumes = [];
                    
                    data.forEach(function(entry) {
                        dates.push(entry.t);
                        prices.push(entry.c);
                        volumes.push(entry.v);
                    });
    
                    // Constructing the data object to be returned
                    var stock_data = {
                        "Date": dates,
                        "Stock Price": prices,
                        "Volume": volumes
                    };
    
                    // Pass the parsed data to displayStockCharts for rendering
                    displayStockCharts(stock_data);
                }
            } 
            else 
            {
                displayError('Error: No record has been found, please enter a valid symbol');
            }
        };
        
        xhr.onerror = function() 
        {
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
                    displayError(response.error);
                } 
                else 
                {
                    var parsedNews = [];
                    var count = 0;
    
                    for (var i = 0; i < response.length; i++) 
                    {
                        var newsItem = response[i];
                        if (newsItem['image'] && newsItem['headline'] && newsItem['datetime'] && newsItem['url']) 
                        {
                            var parsedItem = 
                            {
                                'Image': newsItem['image'],
                                'Title': newsItem['headline'],
                                'Date': new Date(newsItem['datetime'] * 1000).toISOString().slice(0, 19).replace('T', ' '), // Convert UNIX timestamp to date string
                                'Link to Original Post': newsItem['url']
                            };
                            parsedNews.push(parsedItem);
                            count++;
                            if (count === 5) 
                            {
                                break; // Exit the loop once 5 news items are parsed
                            }
                        }
                    }
    
                    displayStockNews(parsedNews);
                }
            } 
            else 
            {
                displayError('Error: No record has been found, please enter a valid symbol');
            }
        };

        xhr.onerror = function() {
            displayError('Failed to send request');
        };

        xhr.send();
    }
       

    // displays company stocks data 
    function displayStockData(data) 
    {
        var stockInfo = document.getElementById('companystocks');
        stockInfo.innerHTML = '';

        // Create and append the logo image
        var logoImg = document.createElement('img');
        logoImg.src = data['Company Logo'];
        logoImg.alt = 'Company Logo';
        stockInfo.appendChild(logoImg);

        // Append a horizontal rule after the logo
        stockInfo.appendChild(document.createElement('hr'));

        // Create and append other data
        var keys = ['Company Name', 'Stock Ticker Symbol', 'Stock Exchange Code', 'Company Start Date', 'Category'];
        for (var i = 0; i < keys.length; i++) 
        {
            var p = document.createElement('p');

            var keySpan = document.createElement('span'); // Create span for key
            keySpan.textContent = keys[i] + ': '; // Set the key text content
            keySpan.style.fontWeight = 'bold'; // Make keys bolder
            keySpan.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Add font for keys
            p.appendChild(keySpan); // Append the key to the paragraph

            var valueSpan = document.createElement('span'); // Create span for value
            valueSpan.textContent = data[keys[i]]; // Set the value text content
            valueSpan.style.fontWeight = 'lighter'; // Make values lighter
            valueSpan.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Add font for keys
            p.appendChild(valueSpan); // Append the value to the paragraph

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
        trendElement.innerHTML = `<span style="font-weight: bold; font-family: 'Nimbus Sans Novus Std T Medium SC', Arial, sans-serif;">Stock Ticker Symbol:</span> <span style="font-weight: lighter; font-family: 'Nimbus Sans Novus Std T Medium SC', Arial, sans-serif;">${latestTrend.symbol}</span>`;
        stockInfo.appendChild(trendElement);
    
        stockInfo.appendChild(document.createElement('hr'));
    
        // Create and append other data
        var keys = ['Trading Day', 'Previous Closing Price', 'Opening Price', 'High Price', 'Low Price', 'Change', 'Change Percent'];
        for (var i = 0; i < keys.length; i++) 
        {
            var p = document.createElement('p');
            var key = keys[i];
            var value = data[key];       

            var keySpan = document.createElement('span'); // Create span for key
            keySpan.textContent = key + ': '; // Set the key text content
            keySpan.style.fontWeight = 'bold'; // Make keys bolder
            keySpan.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Add font for keys
            p.appendChild(keySpan); // Append the key to the paragraph
    
            if (keys[i] === 'Change' || keys[i] === 'Change Percent') 
            {
                var img = document.createElement('img');
                img.src = data[keys[i]] < 0 ? '../static/img/RedArrowDown.png' : '../static/img/GreenArrowUp.png';
                img.style.width = '15px';
                img.style.height = '15px';
                img.style.verticalAlign = 'middle'; // Align the image vertically with the text
    
                var valueSpan = document.createElement('span'); // Create span for value
                valueSpan.textContent = data[keys[i]]; // Set the value text content
                valueSpan.style.fontWeight = 'lighter'; // Make values lighter
                valueSpan.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Add font for values
    
                // Create a container div for value and image
                var valueContainer = document.createElement('div');
                valueContainer.appendChild(keySpan); // Append the key to the container
                valueContainer.appendChild(valueSpan); // Append the value to the container
                valueContainer.appendChild(img); // Append the image to the container
                p.appendChild(valueContainer); // Append the container to the paragraph
            } 
            else 
            {
                var valueSpan = document.createElement('span'); // Create span for value
                if (keys[i] === 'Trading Day') 
                {
                    var tradingDay = new Date(data[keys[i]] * 1000); // Convert seconds to milliseconds
                    var options = { day: '2-digit', month: 'long', year: 'numeric' };
                    var formattedDate = tradingDay.toLocaleDateString('en-US', options);
                    formattedDate = formattedDate.replace(/(\d+)(?:st|nd|rd|th)/, '$1'); // Remove the ordinal suffix
                    // Swap day and month position
                    formattedDate = formattedDate.replace(/(\w+) (\d+), (\d+)/, '$2 $1, $3');
                    valueSpan.textContent = formattedDate; // Set the formatted date as the text content
                } 
                else 
                {
                    valueSpan.textContent = data[keys[i]]; // Set the value text content normally
                }
                valueSpan.style.fontWeight = 'lighter'; // Make values lighter
                valueSpan.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Add font for values
                p.appendChild(valueSpan); // Append the value to the paragraph
            }
    
            stockInfo.appendChild(p);
    
            // Append a horizontal rule after each paragraph  
            stockInfo.appendChild(document.createElement('hr'));
        }
    
        // Get the latest trend data
        var latestTrend = data.recommendation_trends[data.recommendation_trends.length - 1];
    
        // Define an array of trend values and their corresponding colors
        var trendValues = 
        [
            { label: 'Strong Sell', color: '#ed2937'},
            { label: latestTrend.strongSell, color: '#ed2937' },
            { label: latestTrend.sell, color: '#b25f4a' },
            { label: latestTrend.hold, color: '#77945c' },
            { label: latestTrend.buy, color: '#3cca6c' },
            { label: latestTrend.strongBuy, color: '#02ff7f' },
            { label: 'Strong Buy', color: '#02ff7f'}
        ];
    
        var spacer = document.createElement('div');
        spacer.style.paddingTop = '15px'; // Adjust the top margin as needed
    
        // Append the spacer element to the stockInfo container
        stockInfo.appendChild(spacer);
    
        // Loop through each trend value and create a box for it
        trendValues.forEach(function(trend, index) 
        {
            // Create a span element for the trend value
            var trendBox = document.createElement('span');
        
            // Set text content to the trend label
            trendBox.textContent = trend.label;
        
            // Apply styling for the trend box
            trendBox.style.backgroundColor = index === 0 || index === trendValues.length - 1 ? 'white' : trend.color;
            trendBox.style.color = index === 0 ? '#ed2937' : index === trendValues.length - 1 ? '#02ff7f' : 'white';
            trendBox.style.fontWeight = 'lighter'; // Apply lighter font weight
            trendBox.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Apply specified font family
            trendBox.style.padding = '10px';
            trendBox.style.fontSize = '18px';
        
            // Append the trend box to the stockInfo element
            stockInfo.appendChild(trendBox);
        });        
    
        var rectrends = document.createElement('h4');
        rectrends.textContent = data['rectrends'];
        rectrends.style.fontWeight = 'lighter'; // Apply lighter font weight
        rectrends.style.fontSize = '18px';
        rectrends.style.fontFamily = 'Nimbus Sans Novus Std T Medium SC, Arial, sans-serif'; // Apply specified font family
        stockInfo.appendChild(rectrends);
    }       
          
    // displays company stock charts data
    function displayStockCharts(data) {
        // Check if data is empty or undefined
        if (!data || !data['Date'] || !data['Stock Price'] || !data['Volume'] || data['Date'].length === 0) 
        {
            displayError('Error: No record has been found, please enter a valid symbol');
            return;
        }
    
        // Extracting data from the response
        var dates = data['Date'].map(function(timestamp) 
        {
            return new Date(timestamp).getTime();
        });
        var prices = data['Stock Price'];
        var volumes = data['Volume'];
    
        // Constructing data series for HighCharts
        var stockPriceData = dates.map(function(date, index) 
        {
            return [date, prices[index]];
        });
    
        var volumeData = dates.map(function(date, index) 
        {
            return [date, volumes[index]];
        });
    
        // Display HighCharts code
        Highcharts.stockChart('stockCharts', 
        {
            rangeSelector: 
            {
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
                selected: 0, // Index of the button to be selected by default
                inputDateFormat: '', // Remove from date label
                inputEditDateFormat: '', // Remove to date label
                inputDateParser: null
            },            
            title: 
            {
                text: 'Stock Price ' + stock_ticker  + ' ' + getTodayDate()
            },
            subtitle: 
            {
                text: '<a href="https://polygon.io/">Source: Polygon.io</a>',
                useHTML: true
            },
            xAxis: 
            {
                type: 'datetime',
                title: {
                    text: 'Date'
                },
            },
            yAxis: [{
                title: 
                {
                    text: 'Stock Price'
                },
                labels: 
                {
                    format: '{value:.2f}'
                },
                tickAmount: 6,
                opposite: false, // Align this yAxis on the left
                events: 
                {
                    setExtremes: function (e) 
                    {
                        var min = e.min,
                            max = e.max,
                            dataMin = this.dataMin,
                            dataMax = this.dataMax,
                            tickPositions = [],
                            tickInterval;
    
                        // Calculate tick interval based on data range
                        tickInterval = (max - min) / 4; // Adjusted to get 5 ticks including max and min
    
                        // Generate tick positions
                        for (var i = min; i <= max; i += tickInterval) 
                        {
                            tickPositions.push(i);
                        }
    
                        // Update tick positions
                        this.update({
                            tickPositions: tickPositions
                        });
                    }
                }
            }, {
                title: 
                {
                    text: 'Volume'
                },
                labels: 
                {
                    formatter: function () 
                    {
                        switch (this.value) 
                        {
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
                    linearGradient: 
                    {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: 
                    [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                data: stockPriceData,
                tooltip: 
                {
                    valueDecimals: 2
                }
            }, 
            {
                name: 'Volume',
                type: 'column',
                color: 'black', // Change the color of the volume bars to black
                fillColor: 'black', // Fill the volume bars with black color
                yAxis: 1, // Use the second yAxis for this series
                data: volumeData,
                tooltip: 
                {
                    valueDecimals: 0
                },
                pointWidth: 4
            }]
        });
    }
    
    // displays company stock news data
    function displayStockNews(data) 
    {
        var stockInfo = document.getElementById('stockNews');
        stockInfo.innerHTML = '';
    
        // Iterate through the data array
        data.forEach(function(article) 
        {
            // Create a div element for each article
            var card = document.createElement('div');
            card.classList.add('card');
    
            // Add the article image if available
            if (article['Image']) 
            {
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
            var dateString = article['Date'];

            // Custom function to format the date
            function formatDate(dateString) 
            {
                var date = new Date(dateString);
                var day = date.getDate();
                var month = date.toLocaleString('en-US', { month: 'long' });
                var year = date.getFullYear();
                return day + ' ' + month + ', ' + year;
            }

            // Create a paragraph element
            var dateElement = document.createElement('p');

            // Set its text content to the formatted date
            dateElement.textContent = formatDate(dateString);

            // Append the paragraph element to the cardText element
            cardText.appendChild(dateElement);

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

    function getTodayDate() 
    {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();
        return yyyy + '-' + mm + '-' + dd;
    }    

    // displays company stock news data
    function displayError(errorMsg) 
    {
        // Remove any existing error messages
        var existingErrorMessages = document.querySelectorAll('.error-message');
        existingErrorMessages.forEach(function(element) 
        {
            element.remove();
        });
    
        var contentDisplay = document.querySelector('.content-display');
        contentDisplay.style.display = 'none';
    
        // Display the error message
        var errorMessage = document.createElement('div');
        errorMessage.textContent = errorMsg;
        errorMessage.classList.add('error-message');
        document.body.appendChild(errorMessage);
    }
       
    
});


