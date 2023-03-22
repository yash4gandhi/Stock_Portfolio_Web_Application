import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BackendService } from '../backend.service';

// stockItem in localStorage: {
//   ticker: string,
//   name: string,
//   quantity: number, // positive
//   totalCost: number  // no need for avgCost = totalCost / quantity
// }

@Component({
  selector: 'app-transaction-button',
  templateUrl: './transaction-button.component.html',
  styleUrls: ['./transaction-button.component.css'],
})
export class TransactionButtonComponent implements OnInit {
  @Input() public ticker: string;
  @Input() public name: string;
  @Input() public currentPrice: number;
  @Input() public opt: string; // 'Buy' or 'Sell'
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  inputQuantity: number = 0;
  purchasedQuantity: number = 0;
  stockItem;
  errorMessage:string=null;

  getTickerStorage() {
    let portfolioArr = localStorage.getItem('Portfolio')
      ? JSON.parse(localStorage.getItem('Portfolio'))
      : [];
    if (this.opt == 'Sell') {
      this.stockItem = portfolioArr.filter(
        (data) => data.ticker == this.ticker
      )[0];
      this.purchasedQuantity = this.stockItem.quantity;
    } else if (this.opt === 'Buy') {
      this.stockItem = portfolioArr.filter((data) => data.ticker == this.ticker)
        .length
        ? portfolioArr.filter((data) => data.ticker == this.ticker)[0]
        : { ticker: this.ticker, name: this.name, quantity: 0, totalCost: 0 };
    }
  }
  validateWallet(){

    if(this.opt=='Buy'){
      let rem=localStorage.getItem('walletBalance');
      
      if(!rem || rem=="25000"){
        let buyValue=this.currentPrice*this.inputQuantity;
        if(buyValue<25000){
          let rembalance=25000-buyValue;
        
          this.errorMessage=null;
        }else{
          this.errorMessage="Not Enough Money in Wallet!"
        }
       
      }else{
        let buyValue=this.currentPrice*this.inputQuantity;
        let remWalletbalance=JSON.parse(rem);
        if(buyValue<=(+remWalletbalance) ){
          let rembalance=(+remWalletbalance)-buyValue;
          //localStorage.setItem('walletBalance',rembalance.toString());
          this.errorMessage=null;
        }else{
          this.errorMessage="<p> color='red'Not Enough Money in Wallet!</p>"
        }
      }
    }else if(this.opt=='Sell'){
      let portfolio=JSON.parse(localStorage.getItem('Portfolio'));
      let filter=portfolio.filter(el=>el.ticker.toLowerCase()==this.ticker.toLowerCase());
      let oldQuantity=filter[0].quantity;
      if(this.inputQuantity>oldQuantity){
        this.errorMessage="You can not sell the stocks that you don't have!"
      }else{
        this.errorMessage=null;
      }
    } 
  }
  public executeOpt() {
    if (this.opt === 'Sell') {
      let avgcost = this.stockItem.totalCost / this.stockItem.quantity;
      this.stockItem.quantity -= this.inputQuantity;
      this.stockItem.totalCost -= avgcost * this.inputQuantity;
      let walletBalance= localStorage.getItem('walletBalance')
      let newBalance=(this.inputQuantity*this.currentPrice)+(+walletBalance);
      
      localStorage.setItem('walletBalance',newBalance.toString())
      console.log(
        `Sell ${this.ticker} ${this.inputQuantity}, ${this.stockItem.quantity} left, totalCost ${this.stockItem.totalCost}`
      );
    } else if (this.opt === 'Buy') {
      
      this.stockItem.quantity += this.inputQuantity;
      this.stockItem.totalCost += this.currentPrice * this.inputQuantity;
      let walletBalance= localStorage.getItem('walletBalance')
      
      if(!walletBalance || walletBalance=="25000"){
        let newBuy=this.currentPrice * this.inputQuantity;
        localStorage.setItem('walletBalance', (25000-newBuy).toString());
      }else{
        let bal=+walletBalance;
        let newBuy=this.currentPrice * this.inputQuantity;
        localStorage.setItem('walletBalance',(bal-newBuy).toString());
      }
      
      console.log(
        `Buy ${this.ticker} ${this.inputQuantity}, ${this.stockItem.quantity} now, totalCost ${this.stockItem.totalCost}`
      );
    }
    this.service.hasUserBuySell.next(true);
    let portfolioArr = localStorage.getItem('Portfolio')
      ? JSON.parse(localStorage.getItem('Portfolio'))
      : [];
    if (!this.stockItem.quantity) {
      // delete stockItem from localStorage
      let portfolioArrNew = portfolioArr.filter(
        (data) => data.ticker != this.ticker
      );
      localStorage.setItem('Portfolio', JSON.stringify(portfolioArrNew));
    } else {
      // replace stockItem from localStorage
      if (portfolioArr.filter((item) => item.ticker == this.ticker).length) {
        portfolioArr.forEach((item, i) => {
          if (item.ticker == this.stockItem.ticker) {
            portfolioArr[i] = this.stockItem;
          }
        });
      } else {
        portfolioArr.push(this.stockItem);
      }
      localStorage.setItem('Portfolio', JSON.stringify(portfolioArr));
    }
   
    this.transModalService.close(this.stockItem);
  }

  constructor(public transModalService: NgbActiveModal,private service: BackendService) {}
  walletBalance:number
  ngOnInit() {
   
    this.getTickerStorage();
    this.walletBalance=this.service.getWalletBalance();
  }
}
