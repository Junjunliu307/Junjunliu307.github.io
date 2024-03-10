from datetime import datetime, timedelta
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import finnhub
from polygon import RESTClient

# Create your views here.
def search(request):
    sym = request.GET.get('symbol')
    current_date = datetime.now().date()
    finnhub_client = finnhub.Client(api_key=request.GET.get('tokenF'))
    polygon_client = RESTClient(api_key=request.GET.get('tokenP')[:-1])
    res = finnhub_client.company_profile2(symbol=sym)
    if res == {}:
        return JsonResponse(res)
    res.update(finnhub_client.quote(symbol=sym))
    res.update(finnhub_client.recommendation_trends(symbol=sym)[0])
    aggs = []
    for a in polygon_client.list_aggs(ticker= sym, multiplier=1, timespan="day", from_=str(current_date - timedelta(days=183)), to=str(current_date)):
        aggs.append([a.timestamp,a.close,a.volume])
    res.update({'chartData':aggs})
    news = finnhub_client.company_news(symbol=sym, _from=str(current_date - timedelta(days=30)), to=str(current_date))
    for i in range(len(news)-1,-1,-1):
        if news[i]["image"] == "" or news[i]["url"] == "" or news[i]["headline"] == "" or news[i]["datetime"] == "":
            del news[i]
    news = news[:5] if len(news)>5 else news
    res.update({'latestNews':news})
    return JsonResponse(res)