import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { switchMap, tap, finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { autofill } from '../autofill';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchFormComponent implements OnInit {
  autofilloutpu: autofill[] = [];
  searchForm: FormGroup;
  isLoading = false;
  ticker: string;
  nullTickerExists:boolean=false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private backService: BackendService,
     private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    let tempTicker=this.backService.getTicker();
    if(tempTicker){
      this.router.navigateByUrl('/search/' + tempTicker.toUpperCase());
    }

    this.route.paramMap.subscribe(param=>{
     console.log("params",param.get('ticker'))
     if(param.get('ticker')){
       this.ticker=param.get('ticker');
       this.searchForm = this.formBuilder.group({ input:this.ticker });
       console.log(this.searchForm)
     }else{
       this.searchForm = this.formBuilder.group({ input: '' });
     }
     
    })
    
    this.searchForm
      .get('input')
      .valueChanges.pipe(
        tap(() => (this.isLoading = true)),
        switchMap((value) =>
          this.backService
            .fetchSearchutil(value)
            .pipe(finalize(() => (this.isLoading = false)))
        )
      )
      .subscribe((companies) => {
        console.log("symbol",companies)
        this.autofilloutpu = companies});
  }

  onSubmit(tdata) {
    let tempdata=this.searchForm.get('input').value;
    if(!tempdata){
      this.nullTickerExists=true;
      return;
    }
    
    if(typeof(tdata.input)=='string'){
      this.backService.setTickerMethod(tdata.input);
      this.router.navigateByUrl('/search/' + (tdata.input).toUpperCase())
    }else{
      this.ticker = tdata.input.symbol;
      this.backService.setTickerMethod(this.ticker);
      this.router.navigateByUrl('/search/' + this.ticker.toUpperCase());
      this.searchForm.reset();
    }
    

    
  }


  show(company: autofill) {
    if (company) {
      return company.symbol;
    }
  }
  clearValue(){
    // this.router.navigate['/']
    
  }
}
