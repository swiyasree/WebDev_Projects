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

@app.route('/search')
def search():
    stock_ticker = request.args.get('stock_ticker')

    news_data = get_news(stock_ticker)
    charts_data = get_stock_charts(stock_ticker)
    company_data = get_stock_data(stock_ticker)
    summary_data = get_stock_summary(stock_ticker)

    return jsonify({
        "news": news_data,
        "charts": charts_data,
        "company": company_data,
        "summary": summary_data
    })

@app.route('/get_stock_data')
def get_stock_data():
    stock_ticker = request.args.get('stock_ticker')

    c_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={stock_ticker}&token=cn18egpr01qvjam1s380cn18egpr01qvjam1s38g'
    
    c_response = requests.get(c_url)
    
    if c_response.status_code == 200:
        return c_response.json()
    else:
        return jsonify({'Error': 'No record has been found, please enter a valid symbol'})

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

        return jsonify({
            "ss_data": ss_data,
            "rt_data": rt_data
        })
    else:
        return jsonify({'Error': 'No record has been found, please enter a valid symbol'})
    
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
        return jsonify(response.json())
    else:
        return jsonify({'Error': 'No record has been found, please enter a valid symbol'})


@app.route('/get_news')
def get_news():
    stock_ticker = request.args.get('stock_ticker')
    current_date = datetime.now().date()
    BEFORE_30 = (current_date - relativedelta(days=30)).strftime('%Y-%m-%d')
    TODAY = current_date.strftime('%Y-%m-%d')

    url = f'https://finnhub.io/api/v1/company-news?symbol={stock_ticker}&from={BEFORE_30}&to={TODAY}&token=cn18egpr01qvjam1s380cn18egpr01qvjam1s38g'
    
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.content
    else:
        return jsonify({'Error': 'No record has been found, please enter a valid symbol'})
    
if __name__ == '__main__':
    app.run(debug=True)
