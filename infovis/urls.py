"""stocktwitsinfovis URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from . import views

app_name = 'infovis'
urlpatterns = [
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^test$', views.test, name='test'),
    url(r'^api$', views.api, name='api'),
    url(r'^get_top_symbols', views.get_top_symbols, name='get_top_symbols'),
    url(r'^get_treemap', views.get_treemap, name='get_treemap'),
    url(r'^get_latest_messages', views.get_latest_messages, name='get_latest_messages'),
    url(r'^get_keyword_cloud', views.get_keyword_cloud, name='get_keyword_cloud'),
    url(r'^get_chart_data', views.get_chart_data, name='get_chart_data'),
    url(r'^get_sentiment', views.get_sentiment, name='get_sentiment'),
    url(r'^realtime_once', views.realtime_once, name='realtime_once'),
    url(r'^realtime', views.realtime, name='realtime'),
]
