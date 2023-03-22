import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer, forkJoin } from 'rxjs';
import { BackendService } from '../backend.service';
import { currprices } from '../currprices';


@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
})
export class WatchlistComponent implements OnInit {
  checknull;
  localwatch;
  localstoragewatchlist; // array of LatestPrice objects, obtained from latest price fetch
  donefetch = false;
  fetchSubscribe: Subscription;

  constructor(private backendService: BackendService, private router: Router) {}

  fetchAllTicker() {
    // console.log('Start fetch ' + Date());
   
    this.fetchSubscribe = timer(0, 10000*100000).subscribe(() => {
      this.checkEmpty();
      let callArr = [];
      this.localwatch.forEach((item) => {
        callArr.push(this.backendService.fetchLatestPrice(item.ticker));
      });
      forkJoin(callArr).subscribe((responses) => {
        // console.log('real fetch time: ' + Date());
        let infoArr = [];
        console.log('Response in forkJoin: ' + responses);

        responses.forEach((res: currprices) => {
          let stock = this.localwatch.filter(
            (data) => data.ticker === res.ticker
          )[0].name;
          let info = {
           ticker: res.ticker,
            name: stock,
            last: res.c,
            change: res.c - res.pc,
            changePercent: (100 * (res.c - res.pc)) / res.pc,
            timestamp: res.t,
          };
          infoArr.push(info);
        });
        this.localstoragewatchlist = infoArr;
        this.donefetch = true;
        console.log(this.localstoragewatchlist);
      });
    });
  }

  checkEmpty() {
    this.localwatch = localStorage.getItem('Watchlist')
      ? JSON.parse(localStorage.getItem('Watchlist'))
      : [];
    if (this.localwatch.length) {
      this.checknull = false;
    } else {
      this.checknull = true;
    }
  }


  public ltd(ticker) {
    this.router.navigateByUrl('/search/' + ticker);
  }
  
  public watchremove(tickerItem) {
    this.localstoragewatchlist.splice(this.localstoragewatchlist.indexOf(tickerItem), 1);
    let localwatchOld = JSON.parse(localStorage.getItem('Watchlist'));
    let localwatchNew = localwatchOld.filter(
      (data) => data.ticker != tickerItem.ticker.toUpperCase()
    );
    localStorage.setItem('Watchlist', JSON.stringify(localwatchNew));
    this.checkEmpty();
  }

  

  ngOnInit() {
    this.fetchAllTicker();

  }

  ngOnDestroy() {
    this.fetchSubscribe.unsubscribe();
    console.log('Exist from Watchlist');
  }
}
