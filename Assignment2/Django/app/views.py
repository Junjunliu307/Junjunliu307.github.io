from datetime import datetime, timedelta
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import finnhub
from polygon import RESTClient

# Create your views here.
def index(request):
    return render(request,"index.html")
def search(request):
    sym = request.GET.get('symbol')
    current_date = datetime.now().date()
    finnhub_client = finnhub.Client(api_key=request.GET.get('tokenF'))
    polygon_client = RESTClient(api_key=request.GET.get('tokenP'))
    res = finnhub_client.company_profile2(symbol=sym)
    res.update(finnhub_client.quote(symbol=sym))
    res.update(finnhub_client.recommendation_trends(symbol=sym)[0])
    aggs = []
    for a in polygon_client.list_aggs(ticker= sym, multiplier=1, timespan="day", from_=str(current_date - timedelta(days=183)), to=str(current_date)):
        aggs.append([a.timestamp,a.close,a.volume])
    res.update({'chartData':aggs})
    news = finnhub_client.company_news(symbol=sym, _from=str(current_date - timedelta(days=30)), to=str(current_date))
    news = news[-5:] if len(news)>5 else news
    res.update({'latestNews':news})
    return JsonResponse(res)