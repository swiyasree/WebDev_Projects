import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../watchlist.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FormsModule, NgIf, HttpClientModule, CommonModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})

export class WatchlistComponent implements OnInit {
  watchlistData: any;
  loading: boolean | undefined;
  isMobileView: boolean = false;
  cticker: any;

  constructor(private http: HttpClient, private watchlistservice: WatchlistService) {
    this.watchlistservice.tickerUpdate$.subscribe(ticker => 
      {
      this.cticker = ticker;
      this.ngOnInit();
      });
  }

  ngOnInit(): void {
    this.checkMobileView();
    this.http.get<any[]>('http://localhost:5172/watchlist')
      .subscribe(data => {
        this.watchlistData = data;
      });
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  removeFromWatchlist(id: string) 
  {
    const ticker = this.watchlistData.find((item: { _id: string; }) => item._id === id)?.profile_data.symbol;
  
    // Emit the ticker value using the service
    if (ticker) {
      this.watchlistservice.updateTicker(ticker);
    }

    this.http.delete<any>(`http://localhost:5172/watchlist/${id}`)
      .subscribe(response => 
        {
        this.watchlistData = this.watchlistData.filter((item: { _id: string; }) => item._id !== id);
      }, error => 
      {
        console.error("Error removing entry from watchlist:", error);
      });
  }
  
}
