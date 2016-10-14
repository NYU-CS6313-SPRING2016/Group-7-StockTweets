import requests
import random

class STAPI:
    def __init__(self, request):
        self.token = '7f2eff9048ff46fb4777ba10ec2ad11cd1a506ad'
        self.symbol = 'Undefined'
        self.api = 'https://api.stocktwits.com/api/2/streams/all.json?access_token=%s' % self.token
        if 'symbol' in request.GET:
            self.symbol = request.GET['symbol']
            self.api = 'https://api.stocktwits.com/api/2/streams/symbols.json?access_token=%s&symbols=%s' % (self.token, self.symbol)

    def request(self):
        try:
            response = requests.get(url=self.api)
            json_obj = response.json()
            return json_obj
        except Exception as e:
            print 'Error when calling API', e
            return None

    def get_random(self, num, sp100):
        count = 0
        print 'sfdsdfsdf'
        print self.symbol
        rand_list = [self.symbol]
        print rand_list
        print 'Random starts'
        try:
            while count < num - 1:
                rand_sector = random.choice(sp100.keys())
                rand_symbol = random.choice(sp100[rand_sector])
                if not rand_symbol in rand_list:
                    rand_list.append(rand_symbol['symbol'])
                    count += 1
                else:
                    continue
        except Exception as e:
            print 'Error when get random symbols.'
            return None
        str_list = ','.join(rand_list)
        print str_list
        symbol_api = 'https://api.stocktwits.com/api/2/streams/symbols.json?access_token=%s&symbols=%s' % (self.token, str_list)
        try:
            response = requests.get(url=symbol_api)
            json_obj = response.json()
            return json_obj
        except Exception as e:
            print 'Error when calling API to get random symbols', e
            return None
