import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, timer } from 'rxjs';
import {  debounceTime } from 'rxjs/operators';
import * as Highcharts from 'highcharts/highstock';
import { Options } from 'highcharts/highstock';
declare var require: any;
require('highcharts/indicators/indicators')(Highcharts); // loads core and enables sma
require('highcharts/indicators/volume-by-price')(Highcharts); // loads enables vbp
import { BackendService } from '../backend.service';
import { TransactionButtonComponent } from '../buyandsell/buyandsell.component';
import { NewsDetailComponent } from '../news-tab/news-tab.component';
import { News } from '../news';
import { Insights, Insightsarray } from '../insight';

function LATimezonOffset(timestamp) {
  var zone = 'America/Los_Angeles',
    timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

  return timezoneOffset;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  tickerExist = true;
  inWatchlist = false;
  private bookmarksuc = new Subject<string>();
  private buysuc = new Subject<string>();
  getdata; 
  ssm = '';
  buySuccessMessage = '';
  ticker: string = '';
  company;
  todayprice;
  todaychart;
  histdatachart;
  reccharts: Options;
  earchart: Options;
  peerList:string[]=[]
  insights: Insights;
  rpos: any = 0;
  rneg: any = 0;
  rtotal: any = 0;
  tpos: any = 0;
  tneg: any = 0;
  ttotal: any = 0;
  currentTimeLA: string;
  localCurrentTime: number;
  change: number;
  changePercent: number;
  lasttimestamp;
  allnews:News[];
  openstatus = false;
  tcc;
  tcf = false;
  hdf = false;
  isHighcharts = typeof Highcharts === 'object';
  chartConstructor = 'stockChart';
  Highcharts: typeof Highcharts = Highcharts; 

  dailyChartOptions: Options;
  histChartOptions: Options;
  

  getPeerList(){
    this.backendService.getPeerList(this.ticker).subscribe(res=>{
      this.peerList=res;
      console.log("peerList",res)
    })
  }
  goToNewTicker(value){
    this.ticker=value;
    this.router.navigateByUrl('/search/' + value);
    this.getData();
    // this.reloadCurrentRoute(value);
        
  }
  reloadCurrentRoute(value) {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate(['/search/' + value]);
        console.log(currentUrl);
    });
  }
  reloadComponent() {
    let currentUrl = this.router.url;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
  }
  createtodaychart() {
    // split the data set into close and volume
    let dailyClose = [],
    dataLength = this.todaychart.t.length;
    let i, intTimestamp;
    let dailyarr =[]

    console.log(dataLength);

    for (i = 0; i < dataLength; i += 1) {

      dailyarr.push([this.todaychart.t[i]*1000,this.todaychart.c[i]])
    }

    console.log("dailyarr",dailyarr);
    this.dailyChartOptions = {

      title: { text: `<div style="color:#737373">${this.ticker.toUpperCase()} Hourly Price Variation</div>`, 
    },
    rangeSelector: {
      enabled: false,
    },
    xAxis: { type: 'datetime' },
    yAxis:{
      opposite:true
    },
    tooltip: {
      split: true,
    },
      series: [
        {
          data: dailyarr,
          color: this.tcc,
          name: this.ticker.toUpperCase(),
          type: 'line',
          tooltip: {
            valueDecimals: 2,
          },
          marker:{enabled:false},
          threshold:null,
        },
      ],
      
      time: {
        getTimezoneOffset: LATimezonOffset,
      },
    }; // required
  }

  createhistdatachart() {
    let i, intTimestamp;

    // split the data set into ohlc and volume
    let ohlc = [],
      volume = [],
      dataLength = this.histdatachart.o.length,
      // set the allowed units for data grouping
      groupingUnits = [
        [
          'week', // unit name
          [1], // allowed multiples
        ],
        ['month', [1, 2, 3, 4, 6]],
      ];


    for (i = 0; i < dataLength; i += 1) {
      // console.log("time",this.histdatachart.t[i]);

     
      
      ohlc.push([
        this.histdatachart.t[i]*1000, // the date
        this.histdatachart.o[i], // open
        this.histdatachart.h[i], // high
        this.histdatachart.l[i], // low
        this.histdatachart.c[i], // close
      ]);

      // console.log("ohlc",ohlc);
      volume.push([
        this.histdatachart.t[i]*1000, // the date
        this.histdatachart.v[i], // the volume
      ]);
    }

    this.histChartOptions = {
      series: [
        {
          type: 'candlestick',
          name: this.ticker.toUpperCase(),
          id: this.ticker,
          zIndex: 2,
          data: ohlc,
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1,
        },
        {
          type: 'vbp',
          linkedTo: this.ticker,
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          linkedTo: this.ticker,
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],
      title: { text: this.ticker.toUpperCase() + ' Historical' },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
      },
      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
        },
        {
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
        },
      ],
      tooltip: {
        split: true,
      },
      plotOptions: {
        // series: {
        //   dataGrouping: {
        //     units: groupingUnits,
        //   },
        // },
      },
      rangeSelector: {
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 2,
      },
      time: {
        getTimezoneOffset: LATimezonOffset,
      },
      navigator: {
        enabled: true
    },
    }; // required
  }


  getCurrentTime() {
    this.localCurrentTime = Date.now();
  }

  constructor(
    private route: ActivatedRoute,
    private backendService: BackendService,
    private newsModalService: NgbModal,
    private transModalService: NgbModal,
    private changeDet: ChangeDetectorRef,
    private router: Router
  ) {}

  openNewsDetail(news: News) {
    const newsModalRef = this.newsModalService.open(NewsDetailComponent);
    newsModalRef.componentInstance.news = news;
  }

  fetchcompany() {
    this.backendService.fetchcompany(this.ticker).subscribe((company) => {
      this.company = company;
      if(this.company.length<=0){
        this.tickerExist=false
      }else{
        if (this.company.ticker) {
          this.tickerExist = true;
        } else {
          this.tickerExist = false;
        }
      }
     
    
      // console.log(this.company);
    });
  }

  fetchNews() {
    this.allnews=[]
    this.backendService.fetchNews(this.ticker).subscribe((allnews) => {
       //this.allnews = allnews;
       let i = 0;
       allnews.forEach(element => {
        if(element.image && i<21){
          i = i+1;
         this.allnews.push(element);
        }
       });
      // console.log('News fetched ' + JSON.stringify(this.allnews));
    });
  }

  fetchtodaypriceNtodaychart() {
    
    this.getdata = timer(0, 15000).subscribe(() => {
      // update data every 15 seconds
    console.log('todaypriceNtodaychart Start IN  CHART: ' + Date());

    this.backendService
    .fetchtodayprice(this.ticker)
    .subscribe((todayprice) => {
      this.todayprice = todayprice;
      console.log("todayprice",todayprice)
      if (this.todayprice.c) {
        console.log("herer")
        this.tickerExist = true;
        this.change = this.todayprice.c - this.todayprice.pc;
        if (this.change > 0) {
          this.tcc = '#008000';
        } else if (this.change < 0) {
          this.tcc = '#FF0000';
        } else {
          this.tcc = '#000000';
        }
        this.changePercent =
          (100 * this.change) / this.todayprice.pc;
        this.lasttimestamp = new Date(this.todayprice.t*1000);
        this.getCurrentTime();
        let timeDifference = this.localCurrentTime - this.lasttimestamp;
        // console.log('Time difference:' + timeDifference / 1000 + 's');

        if (timeDifference < 60 * 1000) {
          this.openstatus = true;
        } else {
          this.openstatus = false;
        }

        // last working day can be achieve from last timestamp
        let insertdate = this.todayprice.t;
        console.log(this.todayprice.t);
        var date = new Date(this.todayprice.t*1000);

        var fdate = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        this.todayprice.t = fdate;
        console.log(this.todayprice.t);

        let lastWorkingDate = this.todayprice.t;
        console.log('Last working date: ' + lastWorkingDate);
        this.backendService
          .fetchtodaychart(this.ticker, insertdate)
          .subscribe((todaychart) => {
            this.todaychart = todaychart;
            console.log(
              'todaychart fetched ' +
                Date() +
                '; Length: ' +
                this.todaychart.length
            );
            this.tcf = false;
            console.log("hereeeee",this.todaychart);
            this.createtodaychart();
            this.tcf = true;
            console.log('todaychart created ' + Date());
            
          });
      } else {
        this.tickerExist = false;
        this.todaychart = { detail: 'Not found.' };
      }

      console.log('todayprice fetched ' + Date());
    });

      });
  }

  getinsightsdata(){
    var temp: Insightsarray[]

    this.backendService.getinsightsdata(this.ticker).subscribe(res=> {
      console.log("insights",res);
      let obj = res;
      this.insights = res;
      console.log("I am here",this.insights.reddit);
      temp = Object.keys(this.insights.reddit).map(key => this.insights.reddit[key])
      for(let i = 0; i < temp.length;i++){
        this.rpos += temp[i].positiveMention;
        this.rneg += temp[i].negativeMention;
        this.rtotal += temp[i].mention;
    }
    temp = Object.keys(this.insights.twitter).map(key => this.insights.twitter[key])
    for(let i = 0; i < temp.length;i++){
      this.tpos += temp[i].positiveMention;
      this.tneg += temp[i].negativeMention;
      this.ttotal += temp[i].mention;
  }
      console.log(this.rtotal,this.ttotal);
      console.log(temp.length)
    })
  }

  

  fetchearnings(){
    this.backendService.getearnings(this.ticker).subscribe(res=>{
      console.log("earnings",res);

      let actual = [];
let surprise = [];
let estimate = [];
let period = [];

for(var i = 0; i < res.length; i++) {
	actual.push(res[i].actual)
  period.push(res[i].period + "<br>Surprise: " + res[i].estimate)
  estimate.push(res[i].estimate)
  surprise.push(res[i].surprise)
  
}
console.log(period)

this.earchart = {
		 chart: {
        type: 'spline',
        // marginRight:30,
    },
    
    title: {
        text: 'Historical EPS Surprises'
    },

    xAxis: {
        categories: period,
        
    },

    
		yAxis: {
        title: {
            text: 'Quarterly EPS'
        }
    },
    
    legend: {
        enabled:true
    },
    tooltip: {
      shared:true
    },
    series: [
      {
        name: 'Actual',
        data: actual,
        type: 'spline',
        color:"#7bb5ec",
    },
    {
      name: 'Estimate',
      data: estimate,
      type: 'spline',
      color: "#434343",
    }
  ],


};

      

    })

  }


 fetchrec(){
  this.backendService.getrec(this.ticker).subscribe(res=> {
    
    console.log("recommendation",res);
    
    let strong_buy= []
let buy = []
let hold = []
let sell = []
let strong_sell = []
let period_arr = []

for(var i = 0; i < res.length; i++) {
	strong_buy.push(res[i]['strongBuy']);
  buy.push(res[i]['buy']);
  hold.push(res[i]['hold']);
  sell.push(res[i]['sell']);
  strong_sell.push(res[i]['strongSell']);
  period_arr.push(res[i]['period']);
  
}
console.log(strong_buy);
console.log(buy);
console.log(period_arr);
console.log(strong_sell);
console.log(hold);
console.log(sell);


this.reccharts = {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Recommendation Trends'
    },
    xAxis: {
        categories: period_arr
    },
    yAxis: {
        min: 0,
        title: {
            text: '#Analysis'
        },
      
    },
    
    tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
    },
    series: [{
        name: 'Strong Buy',
        data: strong_buy,
        type: 'column',
        color: 'rgb(28,109,55)'
    }, {
        name: 'Buy',
        data: buy,
        type: 'column',
        color: 'rgb(27,169,77)'
    }, {
        name: 'Hold',
        data: hold,
        type: 'column',
        color: 'rgb(156,117,22)'
    },
    {
        name: 'Sell',
        data: sell,
        type: 'column',
        color:'rgb(196,72,74)'
    },
    {
      name: 'Strong Sell',
      data: strong_sell,
      type: 'column',
      color:'rgb(99,37,39)'
    },
    ]
};


  })
 }

  fetchhistdatachart() {
    

    this.backendService
      .fetchhistdatachart(this.ticker)
      .subscribe((histdatachart) => {
        
        this.histdatachart = histdatachart;
        console.log('histdatachart fetched ' + histdatachart);
        this.hdf = false;
        this.createhistdatachart();
        this.hdf = true;
        
      });
  }

  checkWatchlist() {
    let watchlistArr = localStorage.getItem('Watchlist')
      ? JSON.parse(localStorage.getItem('Watchlist'))
      : [];
    let result = watchlistArr.filter(
      (data) => data.ticker === this.ticker.toUpperCase()
    );
    if (result.length) {
      this.inWatchlist = true;
    } else {
      this.inWatchlist = false;
    }
  }

  public onClickStar() {
    this.inWatchlist = !this.inWatchlist;
    let watchlistArr, watchlistArrNew;

    watchlistArr = localStorage.getItem('Watchlist')
      ? JSON.parse(localStorage.getItem('Watchlist'))
      : [];
    if (this.inWatchlist) {
      // add ticker to watchlist
      let watchlistItemNew = {
        ticker: this.ticker.toUpperCase(),
        name: this.company.name,
      };
      watchlistArr.push(watchlistItemNew);
      localStorage.setItem('Watchlist', JSON.stringify(watchlistArr));
    } else {
      // remove ticker from watchlist
      watchlistArrNew = watchlistArr.filter(
        (data) => data.ticker != this.ticker.toUpperCase()
      );
      localStorage.setItem('Watchlist', JSON.stringify(watchlistArrNew));
    }
    this.bookmarksuc.next('Message successfully changed.');
  }

  openTransectionButton(ticker, name, currentPrice, opt) {
    const transModalRef = this.transModalService.open(
      TransactionButtonComponent
    );
    transModalRef.componentInstance.ticker = ticker;
    transModalRef.componentInstance.name = name;
    transModalRef.componentInstance.currentPrice = currentPrice;
    transModalRef.componentInstance.opt = opt;
    transModalRef.result.then((recItem) => {
      this.getPortfolioDetails();
      this.changeDet.detectChanges();
      // trigger opt alert
      console.log(recItem);
      // for buy alert
      this.buysuc.next('Message successfully changed.');
    });
  }
  isWalletBalance:boolean=false;
  hasUserBuySell:boolean=false;
  getData(){
    
    this.fetchtodaypriceNtodaychart();
    this.fetchhistdatachart();
    this.fetchrec();
    this.fetchearnings();
    this.checkWatchlist();
    this.getinsightsdata();
    this.fetchcompany();
    this.fetchNews();
  }
  ngOnInit() {
   
    this.route.paramMap.subscribe((params) => {
    
      this.ticker = params.get('ticker');
      this.getPeerList();
      let portfolioArr = JSON.parse(localStorage.getItem('Portfolio'));
      if(portfolioArr){
       
        portfolioArr.forEach(element => {
          let tempTicker=element.ticker
          if(tempTicker.toLowerCase()==this.ticker.toLowerCase()){
    
            this.isWalletBalance=true;
          }else{
           
            this.isWalletBalance=false;
          }
        });
      }
      this.getData();
      console.log('ticker name in details: ' + this.ticker);
    });
    

    // for star alert -------
    this.bookmarksuc.subscribe(
      (message) => (this.ssm = message)
    );
    this.bookmarksuc
      .pipe(debounceTime(5000))
      .subscribe(() => (this.ssm = ''));

    // for buy success alert -------
    this.buysuc.subscribe(
      (message) => (this.buySuccessMessage = message)
    );
    this.buysuc
      .pipe(debounceTime(5000))
      .subscribe(() => (this.buySuccessMessage = ''));
  }

  ngOnDestroy() {
   // this.getdata.unsubscribe();
    console.log(`Exist from Details/${this.ticker}`);
  }
  getPortfolioDetails(){
    let portfolio=JSON.parse(localStorage.getItem('Portfolio'));
    
    if(portfolio){
      let filter=portfolio.filter(el=>el.ticker.toLowerCase()==this.ticker.toLowerCase());
      if(filter.length>0){
        this.isWalletBalance=true;
        this.hasUserBuySell=!this.hasUserBuySell;
      }else{
        this.isWalletBalance=false;
        this.hasUserBuySell=!this.hasUserBuySell;
      }

    }else{
      this.hasUserBuySell=!this.hasUserBuySell
    }
  }
}
