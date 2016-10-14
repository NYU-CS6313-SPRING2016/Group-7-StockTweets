import random
from datetime import datetime, timedelta
from textblob import TextBlob

def analyse_sentiment(message):
    try:
        if message['entities']['sentiment']['basic'] != None:
            return message['entities']['sentiment']['basic']
    except:
        pass
    threshold = 0.02
    sentence = TextBlob(message['body'])
    if abs(sentence.polarity) < threshold:
        if sentence.polarity == 0:
            sign = 1
        else:
            sign = abs(sentence.polarity)/sentence.polarity
        value = sign * (abs(sentence.polarity) + abs(sentence.subjectivity) + threshold/2.0)
    else:
        value = sentence.polarity
    if value > threshold:
        return 'Bullish'
    elif value < -threshold:
        return 'Bearish'
    else:
        return "Neutral"
    # value = random.randint(-100,100) / 100.0
    # if value > threshold:
    #     return 'Bullish'
    # elif value < -threshold:
    #     return 'Bearish'
    # else:
    #     return "Neutral"

def count_symbol(symbol, sentiment):
    symbol.count += 1
    if sentiment == 'Bullish':
        symbol.bull += 1
    elif sentiment == 'Bearish':
        symbol.bear += 1

def save_to_file(filename, data):
    fout = open('/Users/yuandali/Programs/st_data/' + filename, 'w')
    fout.write(data)
    fout.close()

def str2date(s):
    try:
        year = int(s[0:4])
        month = int(s[5:7])
        day = int(s[8:10])
        hour = int(s[11:13])
        minute = int(s[14:16])
        second = int(s[17:19])
        ret = datetime(year, month, day, hour, minute, second)
    except:
        raise
    return ret

def get_time_frame(request):
    try:
        if ('from' in request.GET) and ('to' in request.GET):
            # api?from=yyyy-mm-ddThh:mm:ss&to=yyyy-mm-ddThh:mm:ss&period=s
            start_time = str2date(request.GET['from'])
            end_time = str2date(request.GET['to'])
            if 'period' in request.GET:
                period = int(request.GET['period'])
            else:
                period = 60 * 10
        elif 'until' in request.GET:
            # api?until=yyyy-mm-ddThh:mm:ss&period=s
            end_time = str2date(request.GET['until'])
            start_time = end_time - timedelta(hours=2)
            if 'period' in request.GET:
                period = int(request.GET['period'])
            else:
                period = 60 * 10
        else:
            # No valid params
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=2)
            period = 60 * 10
    except Exception as e:
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=2)
        period = 60 * 10

    num = int((end_time - start_time).total_seconds() / period)

    if num > 1000:
        num = 1000
        time_period = int((end_time - start_time).total_seconds() / num)
    else:
        time_period = period

    print "---------"
    print 'from:', conv_date(start_time)
    print 'to:', conv_date(end_time)
    print 'delta:', end_time - start_time
    print 'period', timedelta(seconds=period)
    print 'slot num', num
    print 'time_period', time_period
    print "---------"

    ret = {'start_time':start_time, 'end_time':end_time, 'num':num, 'period':period, 'time_period':time_period}
    return ret

def analyse_word_cloud(long_str, wordnum):
    raw_list = long_str.split()
    count = {}
    valid_word_type = ['NNP']
    for word in raw_list:
        if word.isalpha():
            word = word.upper()
            if word in count:
                count[word] += 1
            else:
                if TextBlob(word).tags[0][1] in valid_word_type:
                    count[word] = 1
                else:
                    pass
        else:
            pass
    count = sorted(count.iteritems(), key=lambda d:d[1], reverse = True)
    return count[:wordnum]

def text_sentiment(text):
    print text
    threshold = 0.02
    sentence = TextBlob(text)
    if abs(sentence.polarity) < threshold:
        if sentence.polarity == 0:
            sign = 1
        else:
            sign = abs(sentence.polarity)/sentence.polarity
        value = sign * (abs(sentence.polarity) + abs(sentence.subjectivity) + threshold/2.0)
    else:
        value = sentence.polarity
    if value > threshold:
        return 'Bullish'
    elif value < -threshold:
        return 'Bearish'
    else:
        return "Neutral"

def conv_date(date):
    return date - timedelta(hours=4)







