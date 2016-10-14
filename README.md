#Real-time Visualization of StockTwits
![Screenshot](https://github.com/NYU-CS6313-SPRING2016/Group-7-StockTweets/blob/master/Screenshot_new.png "Screenshot")

##Description
This project provides a real-time visualization tool for StockTwits (ST), an online social media platform for sharing ideas between investors, traders, and entrepreneurs. It encodes the stream of ST user ideas to different views for a better understanding of social mood on stock market.

In this project, the following questions can be easily answered:

This project offers functions:

* Market Overview: What the market looks like based on ST user comments
    * What is the current market sentiment and trending of ST user comments? How much is the volume?
    * Which sectors are user talking about most? Which stocks are users talking about most in these sector? What is the volume and intensity of the sentiment of these stocks?
    * Which stocks are users talking about most?
    * What are the words that ST users mentioned most on the market?
    * What are the contents of users twits? Are they bullish or bearish?

* Market Details:

    a. Sector
    * What is the sentiment, volume and trending of comments of a sector?
    * What does the sentiment look like in this sector?
    * Which stocks are users talking about most in this sector? How much is the volume of these stocks? What does the sentiment look like?
    * What are the words that ST users mentioned most on a sector?
    * What are latest user messages in this sector?

    b. Individual Stock
    * What is the sentiment, volume and trending of comments of a stock?
    * How does current message volume change compared with past hours?
    * What are the words that ST users mentioned most on the stock?
    * What are latest user messages about it?


**Video**: https://vimeo.com/167544405

**Demo(Real-time)**: http://stocktwitsinfovis.herokuapp.com/infovis/ (Last Updated 10/16)

**Final Document**: https://github.com/NYU-CS6313-SPRING2016/Group-7-StockTweets/blob/master/FinalProjectDescription_Group7.pdf

##Data Source
[StockTwits API](http://stocktwits.com/developers)

##Install Instructions
###Requirements
The systems has the following dependences:

1. **Django**: 1.9.3
2. **Python**: 2.7

###Runing
You may directly visit our online website. If you want to run it locally, you can clone the repository by:
```sh
git clone git@github.com:NYU-CS6313-SPRING2016/Group-7-StockTweets.git
```

This project is based on Django framework. It is strongly recommended that you run it in [virtualenv](https://github.com/kennethreitz/python-guide/blob/master/docs/dev/virtualenvs.rst) to create isolated Python environments and install all dependencies.

1. If virtualenv is not installed, install it via pip:

	```sh
		$ pip install virtualenv
	```

2. Create a virtual environment for a project:

	```sh
		$ cd Group-7-StockTweets
		$ virtualenv venv
	```

3. Install required packeges:

	```sh
		$ pip install -r requirements.txt
	```


4. To begin using the virtual environment, it needs to be activated:

	```sh
		$ source venv/bin/activate
	```

5. Run the server for local test:

	```sh
		$ python manage.py runserver
	```

	Then access to `localhost:8000/infovis`

5. If you are done working in the virtual environment for the moment, you can deactivate it:

	```sh
		$ deactivate
	```
