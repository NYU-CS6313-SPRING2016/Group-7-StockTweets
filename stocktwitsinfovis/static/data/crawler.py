import time
import datetime
import urllib2
import requests

if __name__ == "__main__":
    url = 'https://stocktwitsinfovis.herokuapp.com/infovis/realtime_once'
    count = 1
    while count < 1000:
        response = requests.get(url)
        print response.text
        print '[ %s ] Query %d completed.' % (datetime.datetime.now(), count)
        count += 1
        time.sleep(60)