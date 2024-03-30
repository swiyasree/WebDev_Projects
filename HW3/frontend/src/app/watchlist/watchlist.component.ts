import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkMobileView();
    this.http.get<any[]>('http://localhost:5172/watchlist')
      .subscribe(data => {
        this.watchlistData = data;
        this.loading = false; // Set loading to false once data is received
        console.log('watchlist data from backend', this.watchlistData);
      });
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  removeFromWatchlist(id: string) {
    // Make a DELETE request to remove the entry from the watchlist
    this.http.delete<any>(`http://localhost:5172/watchlist/${id}`)
      .subscribe(response => {
        console.log("Entry removed successfully:", response);
        // Remove the deleted entry from the watchlistData array
        this.watchlistData = this.watchlistData.filter((item: { _id: string; }) => item._id !== id);
      }, error => {
        console.error("Error removing entry from watchlist:", error);
      });
  }
  
}
