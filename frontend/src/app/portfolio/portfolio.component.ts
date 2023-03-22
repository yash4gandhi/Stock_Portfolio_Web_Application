import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, timer, forkJoin } from 'rxjs';
import { TransactionButtonComponent } from '../buyandsell/buyandsell.component';
import { bs } from '../backend.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements OnInit,AfterViewInit {
  finalarr;
  isEmpty;
  stockarr; // array for display, obtained from latest price fetch and other caculation
  fetchFinish = false;
  fetchSubscribe: Subscription;

  constructor(
    private bs: bs,
    private transModalService: NgbModal,
    private changeDet:ChangeDetectorRef
  ) {}
    ngAfterViewInit(): void {
        this.bs.hasUserBuySell.subscribe(
          res=>{
         
            if(res){
              this.changeDet.detectChanges()
            }
          }
        )
    }
  stockget() {
    console.log('Start fetch ' + Date());
    public storfpckarr(tickerItem) {
      let finalarrOld = JSON.parse(localStorage.getItem('Portfolio'));
      let finalarrNew = finalarrOld.filter(
        (data) => data.ticker != tickerItem.ticker.toUpperCase()
      );
      localStorage.setItem('Portfolio', JSON.stringify(finalarrNew));
      this.checkEmpty();
    }
  
    removeFromstockarr(tickerItem) {
      let stockarrNew = this.stockarr.filter(
        (data) => data.ticker != tickerItem.ticker
      );
      this.stockarr = stockarrNew;
    }
  
    checkEmpty() {
      this.finalarr = localStorage.getItem('Portfolio')
        ? JSON.parse(localStorage.getItem('Portfolio'))
        : [];
        
      if (this.finalarr.length) {
        this.isEmpty = false;
      } else {
        this.isEmpty = true;
      }
    }
    this.fetchSubscribe = timer(0, 10000*100000).subscribe(() => {
      this.checkEmpty();
      let portarr = [];
      this.finalarr.forEach((item) => {
        
        portarr.push(this.bs.fetchLatestPrice(item.ticker));
      });
      forkJoin(portarr).subscribe((responses) => {
        console.log('real fetch time: ' + Date());
        // console.log('Response in forkJoin: ' + responses);
        let infoArr = [];
        responses.forEach((res: lp) => {
          let tmpItem = this.finalarr.filter(
            (data) => data.ticker === res.ticker
          )[0];
          
        });
        this.stockarr = infoArr;
        this.fetchFinish = true;
      });
    
    
    
    });
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
    this.walletBalance=(+JSON.parse(localStorage.getItem('walletBalance')))
    //this.walletBalance ? this.walletBalance : this.walletBalance=25000;  
    this.changeDet.detectChanges();
      if (recItem) {
        
        console.log(recItem);
        if (recItem.quantity === 0) {
          this.storfpckarr(recItem);
          this.removeFromstockarr(recItem);
        } else {
          this.checkEmpty();  // update this.finalarr from localStorage
          this.stockarr.forEach((item, i) => {
            if (item.ticker == recItem.ticker) {
              this.stockarr[i].quantity = recItem.quantity;
              this.stockarr[i].totalCost = recItem.totalCost;
              this.stockarr[i].avgCost =
                recItem.totalCost / recItem.quantity;
              this.stockarr[i].marketValue =
                recItem.quantity * this.stockarr[i].currentPrice;
              this.stockarr[i].change =
                this.stockarr[i].currentPrice -
                recItem.totalCost / recItem.quantity;
            }
          });
        }
      }
    });
  
  }

  walletBalance:number;
  ngOnInit() {
    this.finalarr=localStorage.getItem('Portfolio')
    this.walletBalance=(+JSON.parse(localStorage.getItem('walletBalance')))
    this.walletBalance ? this.walletBalance : this.walletBalance=25000;
    console.log('Open Portfolio');
    this.stockget();
  }

  ngOnDestroy(): void {
    this.fetchSubscribe.unsubscribe();  // TODO: remove comment after testing
    console.log('Exist from Portfolio');
  }
}
