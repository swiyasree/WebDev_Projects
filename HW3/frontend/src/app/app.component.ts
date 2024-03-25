import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [NgClass, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, WatchlistComponent, PortfolioComponent]
})
export class AppComponent 
{
  title = 'frontend';
  stockStyle = 'btn-default'
  searchStyle = 'btn-default'
  wlStyle = 'btn-default'
  pfStyle = 'btn-default'


  StockSearch() 
  {
    if(this.stockStyle == 'btn-default-active') {
      this.stockStyle = 'btn-default';
    } else {
      this.stockStyle = 'btn-default-active';
      this.searchStyle = 'btn-default';
      this.wlStyle = 'btn-default';
      this.pfStyle = 'btn-default';
    }
  }

  Search() 
  {
    if(this.searchStyle == 'btn-default-active') {
      this.searchStyle = 'btn-default';
    } else {
      this.searchStyle = 'btn-default-active';
      this.stockStyle = 'btn-default';
      this.wlStyle = 'btn-default';
      this.pfStyle = 'btn-default';
    }
  }

  Watchlist() 
  {
    if(this.wlStyle == 'btn-default-active') {
      this.wlStyle = 'btn-default';
    } else {
      this.wlStyle = 'btn-default-active';
      this.stockStyle = 'btn-default';
      this.searchStyle = 'btn-default';
      this.pfStyle = 'btn-default';
    }
  }

  Portfolio() 
  {
    if(this.pfStyle == 'btn-default-active') {
      this.pfStyle = 'btn-default';
    } else {
      this.pfStyle = 'btn-default-active';
      this.stockStyle = 'btn-default';
      this.wlStyle = 'btn-default';
      this.searchStyle = 'btn-default';
    }
  }

}
