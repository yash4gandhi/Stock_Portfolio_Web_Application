import { Injectable } from '@angular/core';
import { Insights } from './insight';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError} from 'rxjs/operators';
import { HOST } from './host-name';
import { todayprice } from './todayprice';
import { companydetails } from './companydetails';
import { autofill } from './autofill';
import { histdata } from './histdata';


@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private autocomplete = HOST + '/autocomplete';
  private companydet = HOST + '/company';
  private todayprice = HOST + '/price';
  private newslist = HOST + '/news';
  private dchart = HOST + '/summaryhistoricaldata';
  private hchart = HOST + '/historicaldata';
  private sentiment = HOST+'/sentiment';
  private peerlist=HOST+'/peer';
  private recommendations = HOST +'/recommendation';
  private earnings = HOST +'/earnings';

  constructor(private http: HttpClient) {
    localStorage.setItem("wallet","25000")
  }
  nfp:boolean=true;
  nfpChanged=new BehaviorSubject<boolean>(false);
  hasUserBuySell=new BehaviorSubject<boolean>(false);
  wb:number=25000;
  wbc=new BehaviorSubject<number>(25000);
  stockvalue:string=null;
  stockvalueChanged=new BehaviorSubject<string>(null);
  getTicker(){
    return this.stockvalue
  }
  stockvalueMethod(value){
    this.stockvalue=value;
    this.stockvalueChanged.next(this.stockvalue);
  }

  getwb(){
    return this.wb;
  }
  setwb(val){
    this.wb=val;
    this.wbc.next(this.wb);
  }
  fsu(ticker: string): Observable<autofill[]> {
    const autourl = `${this.autocomplete}/${ticker}`;
    return this.http.get<autofill[]>(autourl).pipe(
      catchError(this.handleError('fetchSearchutil', [])) // then handle the error
    );
  }

  fcd(ticker: string): Observable<companydetails> {
    const metaDataUrl = `${this.companydet}/${ticker}`;

    return this.http.get<any>(metaDataUrl); 
  }

  flp(ticker: string): Observable<todayprice> {
    const latestPriceUrl = `${this.todayprice}/${ticker}`;
    return this.http.get<todayprice>(latestPriceUrl);
    
  }
  getPeerList(ticker){
    const newsUrl = `${this.peerlist}/${ticker}`;
    return this.http.get<any>(newsUrl);
  }
  fetchNews(ticker: string) {
    const newsUrl = `${this.newslist}/${ticker}`;
    return this.http.get<any>(newsUrl);
    
  }

  fdc(
    ticker: string,
    formDate: string
  ): Observable<todayprice[]> {
    const dcu = `${this.dchart}/${ticker}/${formDate}`;
    return this.http.get<todayprice[]>(dcu);
  }

  getinsightsdata(ticker: string ){
    const insighturl = `${this.sentiment}/${ticker}`;
    return this.http.get<Insights>(insighturl);
    
  }

  getrec(ticker: string ){
    const recurl = `${this.recommendations}/${ticker}`;
    return this.http.get<any>(recurl);
    
  }

  getearnings(ticker: string ){
    const earurl = `${this.earnings}/${ticker}`;
    return this.http.get<any>(earurl);
    
  }



  fhc(ticker: string): Observable<histdata> {
    const histChartsUrl = `${this.hchart}/${ticker}`;
    return this.http.get<histdata>(histChartsUrl);
    
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
