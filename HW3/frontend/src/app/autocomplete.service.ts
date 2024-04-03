import { Injectable } from "@angular/core";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of, Observable } from "rxjs";
import { tap} from 'rxjs/operators';



@Injectable({
    providedIn: 'root'
  })
  export class AutoCompleteService {
    constructor(private http: HttpClient) { }
  
    opts = [];
  
    getData(input:string) {
      return this.opts.length ?
        of(this.opts) :
        this.http.get<any>(`https://stocksearchon.azurewebsites.net/autocomplete?input=${input}`).pipe(tap(data => this.opts = data))
    }
  }