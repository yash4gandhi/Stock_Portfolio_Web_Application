import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailsComponent } from "./details/details.component";
import { WatchlistComponent } from "./watchlist/watchlist.component";
import { PortfolioComponent } from "./portfolio/portfolio.component";
import { SearchFormComponent } from "./search-bar/search-bar.component";

const routes: Routes = [
  { path: '', component: SearchFormComponent },
  
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'search/:ticker', component: DetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
