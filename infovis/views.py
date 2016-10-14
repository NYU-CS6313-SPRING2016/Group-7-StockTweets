from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.http import JsonResponse
from django.http import Http404
from django.template import loader
from django.core.urlresolvers import reverse
from django.views import generic

from models import *

import time
from datetime import datetime, timedelta
import requests
import json
import time
from STAPI import *
from func import *
from apps import InfovisConfig

class IndexView(generic.ListView):
    template_name = 'infovis/index.html'

    def get_queryset(self):
        return

INDIVIDUAL = 'INDIVIDUAL'
ALL_RES = 'ALL_RES'

def init_data():
    with open('sp100.json', 'r') as fin:
            # print fin.read()
            global sp100
            sp100 = json.loads(fin.read())

init_data()

def api(request):
    get_realtime_once(request)
    # Get top_symbols
    try:
        top_symbols = get_top_symbols(request, ALL_RES)
    except:
        top_symbols = []
    # Get treemap
    try:
        treemap = get_treemap(request, ALL_RES)
    except:
        treemap = []
    # Get latest_messages
    try:
        latest_messages = get_latest_messages(request, ALL_RES)
    except:
        latest_messages = []
    # Get chart_data
    chart_data = get_chart_data(request, ALL_RES)

    ret = {'top_symbols':top_symbols, 'treemap':treemap,
                        'latest_messages':latest_messages, 'chart_data':chart_data}
    return JsonResponse(ret)

def get_top_symbols(request, mode=INDIVIDUAL):
    if 'sector' in request.GET:
        sector = request.GET['sector'].replace('_', ' ')
        symbol_list = Symbol.objects.filter(sector__startswith=sector).order_by("-count")[:30]
    else:
        sector = 'ALL'
        symbol_list = Symbol.objects.all().order_by("-count")[:30]

    result = []
    for symbol in symbol_list:
        symbol_item = {"s_id":symbol.symbol_id, "s_symbol":'$'+symbol.symbol, "s_title":symbol.title,
                        "s_sector":symbol.sector.replace(' ', '_'), "s_count":symbol.count}
        result.append(symbol_item)

    if mode == INDIVIDUAL:
        ret = {"top_symbols":result}
        return JsonResponse(ret)
    else:
        return result

def get_treemap(request, mode=INDIVIDUAL):
    sector_list = Symbol.objects.values_list('sector', flat=True).distinct()
    result = { "name":"Treemap" }
    result["children"] = []
    children = []

    for sector in sp100:
        sector_text = sector.replace(' ', '_')
        sector_children = []
        for symbol in sp100[sector]:
            symbol_obj = Symbol.objects.filter(symbol=symbol['symbol'])
            if len(symbol_obj) == 0:
                symbol_item = {"s_id":symbol['id'], "s_symbol":'$'+symbol['symbol'], "s_title":symbol['title'],
                                            "s_count": 0, "s_sentiment":50, "s_sector":sector_text}
            else:
                symbol_id = symbol_obj[0].symbol_id
                map_id_list = Map.objects.filter(symbol_id=symbol_id).values_list('message_id', flat=True)
                msg = Message.objects.filter(message_id__in=map_id_list)
                bull_msg=msg.filter(sentiment__in=['Positive', 'Bullish'])
                if len(msg) == 0:
                    sentiment = 50
                else:
                    sentiment = len(bull_msg) * 100 / len(msg)
                symbol_item = {"s_id":symbol_obj[0].symbol_id, "s_symbol":'$'+symbol['symbol'], "s_title":symbol_obj[0].title,
                                        "s_count": symbol_obj[0].count, "s_sentiment":sentiment, "s_sector":sector_text}
            sector_children.append(symbol_item)
        children.append({"sector":sector_text, "children":sector_children})
    result['children'] = children

    if mode == INDIVIDUAL:
        ret = {"treemap":result}
        return JsonResponse(ret)
    else:
        return result

def get_latest_messages(request, mode=INDIVIDUAL):
    if 'symbol' in request.GET:
        symbol_obj = Symbol.objects.filter(symbol=request.GET['symbol'])
    elif 'sector' in request.GET:
        sector = request.GET['sector'].replace('_', ' ')
        symbol_obj = Symbol.objects.filter(sector__startswith=sector)
    else:
        symbol_obj = Symbol.objects.all()
    symbol_list = symbol_obj.values_list('symbol_id', flat=True)
    map_id_list = Map.objects.filter(symbol_id__in=symbol_list).values_list('message_id', flat=True)
    message_obj = Message.objects.filter(message_id__in=map_id_list).order_by('-created_at')[:30]
    result = []
    for message in message_obj:
        try:
            msg_user = User.objects.get(user_id=message.user_id)
            created_time = conv_date(message.created_at)
            item = {'message_id':message.message_id, 'm_body':message.body, 'created_at':created_time,
                        'user_id':message.user_id, 'username':msg_user.username, 'm_sentiment':message.sentiment}
            result.append(item)
        except Exception as e:
            print 'Exception in fetching latast messages:', e
    if mode == INDIVIDUAL:
        return JsonResponse({"latest_message": result})
    else:
        return result

def get_chart_data(request, mode=INDIVIDUAL):
    time_params = get_time_frame(request)
    start_time = time_params['start_time']
    end_time = time_params['end_time']
    num = time_params['num']
    period = time_params['period']
    time_period = time_params['time_period']

    if 'symbol' in request.GET:
        symbol_obj = Symbol.objects.filter(symbol=request.GET['symbol'])
        symbol_id_list = symbol_obj.values_list('symbol_id', flat=True)
        map_id_list = Map.objects.filter(symbol_id__in=symbol_id_list).values_list('message_id', flat=True)
        message_list = Message.objects.filter(message_id__in=map_id_list).filter(created_at__range=[start_time, end_time])
    elif 'sector' in request.GET:
        symbol_obj = Symbol.objects.filter(sector__startswith=request.GET['sector'].replace('_', ' '))
        symbol_id_list = symbol_obj.values_list('symbol_id', flat=True)
        map_id_list = Map.objects.filter(symbol_id__in=symbol_id_list).values_list('message_id', flat=True)
        message_list = Message.objects.filter(message_id__in=map_id_list).filter(created_at__range=[start_time, end_time])
    else:
        message_list = Message.objects.all().filter(created_at__range=[start_time, end_time])

    result = []
    for i in range(0, num):
        start = start_time + timedelta(seconds=i * time_period)
        end = start_time + timedelta(seconds=(i+1)*time_period)
        if i == num - 1:
            start = datetime(start.year, start.month, start.day, start.hour, (start.minute/10)*10, 0)
        else:
            start = datetime(start.year, start.month, start.day, start.hour, (start.minute/10)*10, 0)
            end = datetime(end.year, end.month, end.day, end.hour, (end.minute/10)*10, 0)
        res = message_list.filter(created_at__range=[start, end])
        try:
            bull = res.filter(sentiment='Bullish')
            pos = res.filter(sentiment='Positive')
            bull_rate = (len(bull) + len(pos)) * 100 / len(res)
        except:
            bull_rate = 50
        new_start = conv_date(start)
        new_end = conv_date(end)
        item = {"period_No.":i, "start_time":str(new_start)[:19], "end_time":str(new_end)[:19],
                "volume":len(res), "sentiment":bull_rate}
        result.append(item)

    if mode == INDIVIDUAL:
        ret = {"chart_data":result}
        return JsonResponse(ret)
    else:
        return result

def get_sentiment(request):
    try:
        sentiment = text_sentiment(request.GET['text'])
    except:
        sentiment = 'No input.'
    return HttpResponse(sentiment)

def realtime_once(request):
    ret = get_realtime_once(request)
    return JsonResponse(ret)

def realtime(request):
    count = 0
    while count < 100:
        count += 1
        print 'Query %d running.' % count
        get_realtime_once(request)
        print 'Query %d finished.' % count
        time.sleep(10)
    return HttpResponse('Done.')

def get_realtime_once(request):
    count = 0
    api = STAPI(request)
    # delete_expired()
    if api.symbol == 'Undefined':
        api_res = api.request()
    else:
        api_res = api.get_random(10, sp100)
    try:
        for each_message in api_res['messages']:
            count += 1
            insert_message(each_message, count)
    except Exception as e:
        print 'Error in get_realtime_once', e
    return api_res

def insert_message(message, num):
    if ('symbols' not in message):
        print '%d Message %d does not contain symbols.' % (num, message['id'])
        return
    # Only save messages for SP100 symbols
    symbol_list = []
    for symbol in message['symbols']:
        try:
            for sp_symbol in sp100[symbol['sector']]:
                if symbol['symbol'] == sp_symbol['symbol']:
                    symbol_list.append(symbol)
        except:
            continue

    if len(symbol_list) == 0:
        print '%d Message %d has no SP100 symbol.' % (num, message['id'])
        return
    else:
        pass

    try:
        # Parse message
        message_sentiment = analyse_sentiment(message)
        msg_obj, created = Message.objects.get_or_create(message_id=message['id'],
                                                defaults={  'body':message['body'].replace("\"","''"),
                                                            'created_at':message['created_at'],
                                                            'user_id':message['user']['id'],
                                                            'sentiment':message_sentiment   })
        if created == False:
            print '%d Message %d already exists.' % (num, message['id'])
            return
        # Parse symbol
        for symbol in symbol_list:
            print '%d  symbol %s detected.' % (num, symbol['symbol'])
            symbol_obj, created = Symbol.objects.get_or_create(symbol_id=symbol['id'],
                                                            defaults={  'symbol':symbol['symbol'],
                                                                        'title':symbol['title'],
                                                                        'exchange':symbol['exchange'],
                                                                        'sector':symbol['sector'],
                                                                        'industry':symbol['industry'],
                                                                        'trending':symbol['trending']   })
            symbol_obj.count += 1
            symbol_obj.save()
            # Parse message-symbol map
            map_obj, created = Map.objects.get_or_create(message_id=message['id'], symbol_id=symbol['id'])
        # Parse User
        user_obj, created = User.objects.get_or_create(user_id=message['user']['id'],
                                            defaults={  'username':message['user']['username'],
                                                        'name':message['user']['name']  })
        user_obj.count += 1
        user_obj.save()
        print '%d Message %d created.' % (num, message['id'])
    except Exception as e:
        print '%d [Failed] Can not insert message %d.' % (num, message['id'])
        print '    Information:', e

def delete_expired():
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=2)
    messages = Message.objects.exclude(created_at__range=[start_time, end_time])
    msg_id_list = messages.values_list('message_id', flat=True)
    user_id_list = messages.values_list('user_id', flat=True)
    fuck = Map.objects.filter(message_id__in=msg_id_list)
    symbol_id_list = fuck.values_list('symbol_id', flat=True)

    for user_id in user_id_list:
        try:
            user_obj = User.objects.get(user_id=user_id)
            if user_obj.count == 1:
                print user_obj.user_id, 'deleted.'
                user_obj.delete()
            else:
                user_obj.count -= 1
                user_obj.save()
                print user_obj.user_id, 'decreased.'
        except Exception as e:
            print 'exception in user:'
            print e

    for symbol_id in symbol_id_list:
        try:
            symbol_obj = Symbol.objects.get(symbol_id=symbol_id)
            if symbol_obj.count == 1:
                symbol_obj.delete()
            else:
                symbol_obj.count -= 1
                symbol_obj.save()
        except Exception as e:
            print 'exception in symbol'
            print e

    messages.delete()
    # fuck.delete()
    for fuckmap_why_cant_delete in fuck:
        print fuckmap_why_cant_delete.id, fuckmap_why_cant_delete.message_id, fuckmap_why_cant_delete.symbol_id, 'deleted. Fuck!'
        fuckmap_why_cant_delete.delete()

def test(request):
    init_data()
    print 'sp100:', sp100
    return JsonResponse(sp100)

def get_keyword_cloud(request, mode=INDIVIDUAL):
    # Get time frame
    params = get_time_frame(request)
    start_time = params['start_time']
    end_time = params['end_time']
    msg_list = Message.objects.filter(created_at__range=[start_time, end_time])
    # Get wordnum
    try:
        wordnum = int(request.GET['wordnum'])
    except:
        wordnum = 6

    # Get sector
    try:
        sector = request.GET['sector']
        # Get sector_id_list from Symbol
        sector_symbol = Symbol.objects.filter(sector=sector).values_list('symbol_id')
        symbol_id_list = []
        for symbol in sector_symbol:
            symbol_id_list.append(symbol[0])
        # Get message_id_list from Map
        message_id = Map.objects.filter(symbol_id__in=symbol_id_list).values_list('message_id').distinct()
        message_id_list = []
        for each_id in message_id.distinct():
            message_id_list.append(each_id[0])
        # Get message_list by filtering msg_list
        msg_list = msg_list.filter(message_id__in=message_id_list)
    except:
        pass
    # Get symbol
    try:
        symbol = request.GET['symbol']
        # Get symbol_id from symbol
        symbol_id = Symbol.objects.get(symbol=symbol).symbol_id
        # Get message_id from Map
        message_id = Map.objects.filter(symbol_id=symbol_id).values_list('message_id')
        message_id_list = []
        for each_id in message_id.distinct():
            message_id_list.append(each_id[0])
        # Get message by message_id_list
        msg_list = msg_list.filter(message_id__in=message_id_list)
    except:
        pass

    msg_list = msg_list.values('body')
    long_str = ''
    for msg in msg_list:
        long_str += msg['body']
        long_str += ' '
    word_list = analyse_word_cloud(long_str, wordnum)

    result = []
    for item in word_list:
        result.append({'word':item[0], 'count':item[1]})

    ret = json.dumps({'word_cloud':result})
    if mode == INDIVIDUAL:
        return HttpResponse(ret)
    else:
        return json.dumps(ret)
