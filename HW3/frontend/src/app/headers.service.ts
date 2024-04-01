import { Injectable } from "@angular/core";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from "rxjs";
@Injectable(
    {providedIn: 'root'}
)
export class HeaderService {
    private watchlisturl = 'http://localhost:5172/watchlist';
    constructor(private http: HttpClient) { }

    getwatchlist(): Observable<any[]> {
        return this.http.get<any[]>(this.watchlisturl);
    }
}