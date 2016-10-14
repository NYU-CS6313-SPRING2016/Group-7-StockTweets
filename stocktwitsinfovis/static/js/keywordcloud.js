
// drawWordCloud();

function drawWordCloud(){
    var text_string = "";
    jQuery.get('/static/data/all_message.txt', function(data) {
      text_string = data;
          
      // var text_string = "StockTwits® STREAMS INBOX HEAT MAP Compose Message Default-avatar-thumbybpan SYMBOL($AAPL) or USERNAME SPONSORED BY: Dow 28.97 S&P 500 2.05 Nasdaq 7.67 TRENDING UWTIUSODWTIOILKITERIGDRIPPEPZIOPHASBGNEXOMCVXVASCEWJBPHONRPMGLDXIBMCVRRWPZSPYJBHTLNCOCPGMROWLLGUSHVMW Watchlist 0.34 -0.25 (-44.87%) SUNE SunEdison Inc 78.95 -0.66 (-0.83%) BABA Alibaba 109.57 -2.53 (-2.26%) AAPL Apple Inc. Recently Viewed SUNE @Github DUST AAPL MSFT AAL AMAG ABC AIG ANTM Hi ybpan Upload Img Chart Share an idea (use $ before ticker: e.g. $SYMBL) All EquitiesForex More streams ALL CHARTS LINKS Pause Pop out Apr. 17 at 7:12 PM Fitzer $SUNE Why doesnt he just loan the money? chrisFoxx 1 Share $SUNE You honestly think a billionaire would let his rep be destroyed because he couldn't secure a 300 million dollar loan or sell an asset? Bullish Apr. 17 at 7:12 PM bangersnpip $OCLR --> tradeunderten.com/2016/04/s... Apr. 17 at 7:12 PM chrisFoxx $SUNE So true. We'll all look back and think Of course no BK Funny how fear blinds us from the obvious davidcyr 1 Share $SUNE last 10-Q 20bil in assets, they owe 11-12bil, need only 310mil to continue to stay on the tracks... Suck it Bears Bullish Apr. 17 at 7:11 PM MRSUNNY $SUNE 250,000,000 shares .67 on monday you heard it first Apr. 17 at 7:11 PM bangersnpip $ASC --> tradeunderten.com/2016/04/s... Apr. 17 at 7:11 PM billybob88 $RPRX 8 bucks Bullish via StockTwits for iOS Apr. 17 at 7:11 PM jesusfollower $AVXL Bullish via StockTwits For Android Apr. 17 at 7:11 PM Blount $SUNE CEO: Ahmad Chatila Year started: 2009 One year stock price change: -94.5% Annual compensation: $7.7 million Apr. 17 at 7:11 PM bangersnpip Stock Watchlist 18 April: $ASC $OCLR $S --> tradeunderten.com/2016/04/s... Apr. 17 at 7:11 PM cazualX0X0 $VCEL This week--->>>BOOM!!!! ackerjl 2 Shares $VCEL Somebody just made a call from the conference and said Buy the crap out of VCEL Bullish Apr. 17 at 7:11 PM howardlindzon Paying with stock finally being watched closely again $LNKD $QQQ t.co/burdychXFU via StockTwits for iOS Apr. 17 at 7:11 PM DANGER8 $UVXY wonder if fox biz chl has harry dent and mark faber on standby for tomorrow. just in case of meltdown. Apr. 17 at 7:11 PM AV8 $UWTI $DWTI $TVIX $UVXY $SPY You just know they are going to push that rollover tonight back over 40 spot for US open PM...shenanigans 1 1 Apr. 17 at 7:11 PM jimbo426 $TVIX Something tells me it will gap up and I'll be in the money here. Rare bird. Bullish Apr. 17 at 7:11 PM chrisFoxx $SUNE You honestly think a billionaire would let his rep be destroyed because he couldn't secure a 300 million dollar loan or sell an asset? Bullish 11 1 Load more messages Viewing older messages will pause this stream. Edit Profile 3 IDEAS 1 FOLLOWERS 0 FOLLOWING 3 WATCHLIST WHOM TO FOLLOW Follow edwardrooster 15,967 Followers Follow scheplick 14,857 Followers Discover official accounts About Help Blog Careers Press Tools Mobile Developers Official House Rules Best Practices Connect with us: Advertise with us Terms Privacy Disclaimer Market Data by Xignite and BATS BZX Real-Time Price © 2016 StockTwits, Inc.";  
      var common = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall,\
                      just,apr,pm,am";

      var word_count = {};

      var words = text_string.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
        if (words.length == 1){
          word_count[words[0]] = 1;
        } else {
          words.forEach(function(word){
            var word = word.toLowerCase();
            if (word != "" && common.indexOf(word)==-1 && word.length>1 && isNaN(parseFloat(word))){
              if (word_count[word]){
                word_count[word]++;
              } else {
                word_count[word] = 1;
              }
            }
          })
        }

      var svg_location = "#keywordcloud";
      var width = $(svg_location).width();
      var height = $(svg_location).height();

      // var fill = d3.scale.category20();

      var word_entries = d3.entries(word_count);

      var xScale = d3.scale.linear()
         .domain([0, d3.max(word_entries, function(d) {
            return d.value;
          })
         ])
         .range([10,100]);

      d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function(d) { return xScale(d.value); })
        .text(function(d) { return d.key; })
        .rotate(0)
        .font("Impact")
        .on("end", draw)
        .start();

      function draw(words) {
        d3.select(svg_location).append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return xScale(d.value) + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return "#BDBDBD"; })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.key; });
      }

      d3.layout.cloud().stop();
    });
}