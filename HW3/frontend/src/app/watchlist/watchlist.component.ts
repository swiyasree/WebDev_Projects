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
  watchlistData: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch watchlist data from the backend
    this.http.get<any[]>('/watchlist')
      .subscribe(data => 
        {
          this.watchlistData = data;
        });
  }

  removeFromWatchlist(id: string) {
    // Make a DELETE request to remove the entry from the watchlist
    this.http.delete<any>(`/watchlist/${id}`)
      .subscribe(response => {
        console.log("Entry removed successfully:", response);
        // Remove the deleted entry from the watchlistData array
        this.watchlistData = this.watchlistData.filter(item => item._id !== id);
      }, error => {
        console.error("Error removing entry from watchlist:", error);
      });
  }
  
}
