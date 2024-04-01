import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private tickerSubject = new Subject<string>();

  tickerUpdate$ = this.tickerSubject.asObservable();

  updateTicker(ticker: string) {
    this.tickerSubject.next(ticker);
  }
}
