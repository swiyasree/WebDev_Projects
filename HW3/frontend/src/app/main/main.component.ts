import { Component, OnInit, input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SearchUtility } from '../search-utility';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
@Component({
  standalone:true,
  selector: 'app-main',
  templateUrl: './main.component.html',
  imports: [MatInputModule, MatAutocompleteModule, MatProgressSpinnerModule, ReactiveFormsModule, CommonModule],
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  filteredCompanies: SearchUtility[] = [];
  searchForm: FormGroup;
  isLoading = false;
  ticker: string;
  http: HttpClient;
  combinedData: any;
  formattedTimestamp: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({ tickerInput: '' });
    
    this.searchForm
      .get('tickerInput')!
      .valueChanges.pipe(
        tap(value => console.log('Input value:', value)),
        debounceTime(300),
        tap(() => (this.isLoading = true)),
        switchMap((value) =>
          this.http
            .get<any>(`https://stocksearchon.azurewebsites.net/autocomplete?input=${value}`)
            .pipe(finalize(() => (this.isLoading = false)))
        )
      )
      .subscribe(
        (options) => {
          if (options && options.result && Array.isArray(options.result)) {
            this.combinedData = options.result.slice(0, 5).map((item: any) => ({
              symbol: item.symbol,
              description: item.description
            }));
          } else {
            console.error('Invalid response format:', options);
            this.combinedData = [];
          }
        },
        (error) => {
          console.error("Error fetching autocomplete data:", error);
        }
      );
  }

  onSubmit(tickerData) 
  {
    if (tickerData.tickerInput.symbol) 
    {
      this.ticker = tickerData.tickerInput.symbol;
    } 
    else 
    {
      this.ticker = tickerData.tickerInput;
    }
    console.log('ticker name in form: ', this.ticker);
    // this.router.navigateByUrl('/search/' + this.ticker);
    this.searchForm.reset();
  }

  displayFn(company: SearchUtility) {
    if (company) {
      return company.symbol;
    }
    return ""
  }
}