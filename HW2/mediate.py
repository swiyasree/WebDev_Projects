from flask import Flask, request, jsonify, render_template
import requests
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import json

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('HW2.html')

from flask import jsonify

@app.route('/get_stock_data')
def get_stock_data():
    stock_ticker = request.args.get('stock_ticker')

    c_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={stock_ticker}&token=cn18egpr01qvjam1s380cn18egpr01qvjam1s38g'
    
    c_response = requests.get(c_url)
    
    if c_response.status_code == 200:
        c_data = c_response.json()  # Convert c_response to JSON

        # Check if essential data is present in the response
        if 'logo' in c_data and 'name' in c_data and 'ticker' in c_data and 'exchange' in c_data and 'ipo' in c_data and 'finnhubIndustry' in c_data:
            new_c_data = {
                "Company Logo": c_data.get("logo"),
                "Company Name": c_data.get("name"),
                "Stock Ticker Symbol": c_data.get("ticker"),
                "Stock Exchange Code": c_data.get("exchange"),
                "Company Start Date": c_data.get("ipo"),
                "Category": c_data.get("finnhubIndustry")
            }
            return jsonify(new_c_data)  # Return JSON response
        else:
            return jsonify({'error': 'Failed to fetch complete stock data'})
    else:
        return jsonify({'error': 'Failed to fetch stock data or invalid stock ticker'})

@app.route('/get_stock_summary')
def get_stock_summary():
    stock_ticker = request.args.get('stock_ticker')

    ss_url = f'https://finnhub.io/api/v1/quote?symbol={stock_ticker}&token=cn18egpr01qvjam1s380cn18egpr01qvjam1s38g'
    rt_url = f'https://finnhub.io/api/v1/stock/recommendation?symbol={stock_ticker}&token=cn18egpr01qvjam1s380cn18egpr01qvjam1s38g'
    
    ss_response = requests.get(ss_url)
    rt_response = requests.get(rt_url)

    if ss_response.status_code == 200 and rt_response.status_code == 200:
        ss_data = ss_response.json() 
        rt_data = rt_response.json()

        recommendation_trends = []
        for trend in rt_data:
            recommendation_trends.append({
                "symbol": trend.get("symbol"),
                "period": trend.get("period"),
                "strongSell": trend.get("strongSell"),
                "sell": trend.get("sell"),
                "hold": trend.get("hold"),
                "buy": trend.get("buy"),
                "strongBuy": trend.get("strongBuy")
            })

        new_ss_data = {
            "Trading Day": ss_data.get("t"),
            "Previous Closing Price": ss_data.get("pc"),
            "Opening Price": ss_data.get("o"),
            "High Price": ss_data.get("h"),
            "Low Price": ss_data.get("l"),
            "Change": ss_data.get("d"),
            "Change Percent": ss_data.get("dp"),
            "recommendation_trends": recommendation_trends,
            "rectrends": "Recommendation Trends"
        }

        return jsonify(new_ss_data)  
    else:
        return jsonify({'error': 'Failed to fetch stock SUMMARY data or invalid stock ticker'})
    
@app.route('/get_stock_charts')
def get_stock_charts():
    stock_ticker = request.args.get('stock_ticker')
    current_date = datetime.now().date()
    from_date = (current_date - relativedelta(months=6, days=1)).strftime('%Y-%m-%d')
    to_date = current_date.strftime('%Y-%m-%d')
    multiplier = "1"
    timespan = "day"

    url = f"https://api.polygon.io/v2/aggs/ticker/{stock_ticker}/range/{multiplier}/{timespan}/{from_date}/{to_date}?adjusted=true&sort=asc&apiKey=7dEn5T3jjmb21Ef1NDWKedyMsaycmj4Z"
    
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json() 

        # Extracting necessary fields from the response
        dates = [entry['t'] for entry in data['results']]
        prices = [entry['c'] for entry in data['results']]
        volumes = [entry['v'] for entry in data['results']]

        # Constructing the data object to be returned
        stock_data = {
            "Date": dates,
            "Stock Price": prices,
            "Volume": volumes
        }
        return json.dumps(stock_data)  
    else:
        return jsonify({'error': 'Failed to fetch stock charts or invalid stock ticker'})

@app.route('/get_news')
def get_news():
    stock_ticker = request.args.get('stock_ticker')
    current_date = datetime.now().date()
    BEFORE_30 = (current_date - relativedelta(days=30)).strftime('%Y-%m-%d')
    TODAY = current_date.strftime('%Y-%m-%d')

    url = f'https://finnhub.io/api/v1/company-news?symbol={stock_ticker}&from={BEFORE_30}&to={TODAY}&token=cn18egpr01qvjam1s380cn18egpr01qvjam1s38g'
    
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()  

        stock_news = []
        count = 0
        for news in data:
            if all(key in news.keys() for key in ['image', 'headline', 'datetime', 'url']) \
               and all(news[key] for key in ['image', 'headline', 'datetime', 'url']):
                stock_news.append({
                    'Image': news['image'],
                    'Title': news['headline'],
                    'Date': datetime.utcfromtimestamp(news['datetime']).strftime('%Y-%m-%d %H:%M:%S'),
                    'Link to Original Post': news['url']
                })
                count += 1
                if count == 5:
                    break

        return jsonify(stock_news) 
    else:
        return jsonify({'error': 'Failed to fetch stock news or invalid stock ticker'})
    
if __name__ == '__main__':
    app.run(debug=True)
