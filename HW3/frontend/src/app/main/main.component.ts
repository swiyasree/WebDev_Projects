import { Component, Injectable, ViewChild, Input} from '@angular/core';
import {  FormBuilder,FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map, finalize } from 'rxjs/operators';
import {HttpClientModule} from '@angular/common/http';
import { Router } from '@angular/router';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { AutoCompleteService } from '../autocomplete.service';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HeaderService } from '../headers.service';

@Component({
  standalone: true,
  selector: 'autocomplete-simple-example',
  imports: [
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,MatFormFieldModule, MatInputModule,MatAutocompleteModule, CommonModule, SearchComponent, RouterOutlet, RouterLink, RouterLinkActive, MatProgressSpinnerModule],
  providers: [AutoCompleteService, HeaderService, HttpClientModule, SearchComponent],
  templateUrl: 'main.component.html',
  styleUrls: ['main.component.css'],
})
export class MainComponent {

  // @ViewChild(SearchComponent) searchComponent: SearchComponent;
  
  tickerInput = new FormControl();
  options = [];
  filteredOptions: Observable<any[]>;
  ticker: string;
  searchForm: FormGroup; 
  isLoading: boolean = false;
  showNoDataMessage: boolean = false;
  submitted: boolean = false;

  constructor( private http: HttpClient, private service:AutoCompleteService, private router: Router, private formBuilder: FormBuilder, private searchComponent:SearchComponent) {
    this.searchForm = this.formBuilder.group({ tickerInput: '' });
     this.filteredOptions = this.tickerInput.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      tap(() => (this.isLoading = true)),
      distinctUntilChanged(),
      switchMap(val => {
            return this.filter(val || '')
       }) 
    )
   }

  ngOnInit() {
   this.tickerInput.setValue(localStorage.getItem('ticker'));
   
  }

  onSubmit(tickerData) {
    if(this.tickerInput.value == '')
    {
      console.log('is empty');
      this.showNoDataMessage = true;
    }
    else {
      this.showNoDataMessage = false;
      this.submitted = true;
      console.log('ticker name in form: ', tickerData, this.tickerInput);
      if (tickerData.tickerInput.symbol) {
        this.ticker = tickerData.tickerInput.symbol;
      } else {
        this.ticker = tickerData.tickerInput;
      }
      localStorage.setItem('ticker', this.tickerInput.value);
      console.log('ticker name in form: ', this.tickerInput.value);
      this.router.navigateByUrl('/search/' + this.tickerInput.value);
      // this.tickerInput.reset();
    }
   
  }

  clearResults() {
    console.log('clearing results');
    this.tickerInput.reset();
    localStorage.setItem('ticker', '')
    this.tickerInput.setValue('');
    console.log('tickerinput: cleared', this.tickerInput.value)
    this.router.navigateByUrl('/home');
    this.showNoDataMessage = true;
    this.searchComponent.clear_results();
    }


  filter(val: string): Observable<any[]> {
    return this.service.getData(val)
     .pipe(
       map(options => {
        if (options && options.result && Array.isArray(options.result)) {

          return options.result.slice(0, options.result.length).map((item: any) => ({
            symbol: item.symbol,
            description: item.description
          }));
        } 
          console.error('Invalid response format:', options);
          
          // return  [];
      }), finalize(() => (this.isLoading = false))
     )
   }  
}


/**  Copyright 2019 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */