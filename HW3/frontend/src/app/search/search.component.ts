import { Component, NgModule, OnInit, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, TemplateRef, Renderer2, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, Subject } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTabGroup } from '@angular/material/tabs';
import { interval, Subscription } from 'rxjs';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import * as Highstockcharts from 'highcharts/highstock';
import HC_indicators from 'highcharts/indicators/indicators';
import HC_VBP from 'highcharts/indicators/volume-by-price';
import HC_dragPanes from 'highcharts/modules/drag-panes';
import HC_exporting from 'highcharts/modules/exporting';
import HC_accessibility from 'highcharts/modules/accessibility';
import moment from 'moment';
import { Router } from '@angular/router';
import 'bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { HeaderService } from '../headers.service';
import { WatchlistService } from '../watchlist.service';
import 'moment-timezone';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { MainComponent } from '../main/main.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

HC_indicators(Highstockcharts);
HC_VBP(Highstockcharts);
HC_dragPanes(Highstockcharts);
HC_exporting(Highstockcharts);
HC_accessibility(Highstockcharts);

const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { }
};

interface DictionaryEntry {
  id: string;
  symbol: string;
}


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FormsModule, NgIf, HttpClientModule, CommonModule,
    MatInputModule, MatFormFieldModule, MatAutocompleteModule, MatTabsModule,
    HighchartsChartModule, NgbModule, ShareButtonsModule,
    ShareIconsModule, RouterModule, MatProgressSpinnerModule],
  providers: [HeaderService, HttpClientModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SearchComponent implements OnInit {
  @Input() stockData: any;
  totalExceedsBalance: boolean = false;
  notEnoughStocks: boolean = false;
  refreshSubscription: Subscription | undefined;
  tickerValue: string = '';
  submitted: boolean = false;
  combinedData: any;
  summaryData: any;
  topNewsData: any;
  chartsData: any;
  insightsData: any;
  balanceAmount: any;
  quantityOfStock: any;
  isStarFilled = false;
  boughtSymbol: string = '';
  soldSymbol: string = '';
  formattedTimestamp: string = '';
  showInvalidTickerMessage: boolean = false;
  showNoDataMessage: boolean = false;
  tickerControl = new FormControl();
  autocompleteOptions: any[] = [];
  autocompleteWidth: string = '240px';
  highcharts = Highcharts;
  symbolDictionary: { [key: string]: string } = {};
  selectedIndex: any;
  sellButtonActive: boolean = false;
  quantity: number = 0;
  total: number = 0;
  totalPrice = 0;
  buysellaction: any;
  DateandTime: any;
  temp: any;
  

  @ViewChild('stockForm') stockForm!: NgForm;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @ViewChild('newsModal', { static: true }) newsModalRef!: TemplateRef<any>;

  // name = 'jimmikki';
  // @ViewChild('mainComponent', { static: false }) mainComponent: MainComponent;

  private inputSubject = new Subject<string>();
  chartOptions: any;
  historicalChartOptions: any;
  dateAndtime: any;
  hpdata: any;
  HPchartOptions: any;
  marketIsOpen: boolean = false;
  watchlistData: any;
  isStarYellow: any;
  isMobileView: boolean = false;
  percentageChange: any;
  portfolioData: any;
  newsmodal: any;
  buysellmodal: any;
  formattedDateAndTime: any;
  cticker: any;
  hourlyChartOptions: any;
  quant: any;
  validTicker: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private dialog: MatDialog, private headerService: HeaderService, private watchlistservice: WatchlistService, private router: Router) {
    // this.inputSubject.pipe(
    //   debounceTime(300),
    //   distinctUntilChanged(),
    //   switchMap(input => this.fetchAutocompleteOptions(input))
    // ).subscribe(options => {
    //   if (options && options.result && Array.isArray(options.result)) {
    //     this.autocompleteOptions = options.result.slice(0, 5).map((item: any) => ({
    //       symbol: item.symbol,
    //       description: item.description
    //     }));
    //   } else {
    //     console.error('Invalid response format:', options);
    //     this.autocompleteOptions = [];
    //   }
    // });
    this.watchlistservice.tickerUpdate$.subscribe(ticker => {
      this.cticker = ticker;
      this.fetchWatchlistData();
    });

    this.checkMobileView();
    
  }

  saveTosessionStorage() {
    sessionStorage.setItem('symbolDictionary', JSON.stringify(this.symbolDictionary));
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      console.log('params', params.get('ticker'));
      this.tickerValue = params.get('ticker');
      localStorage.setItem('ticker', this.tickerValue);
      console.log('ticker name in details: ', this.tickerValue);
    
    this.validTicker = true;
    console.log('tickerValue: ', this.tickerValue);
    this.search_results();
    
    const storedData = sessionStorage.getItem('headerComponentData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.tickerValue = parsedData.tickerValue;
      this.submitted = parsedData.submitted;
      this.combinedData = parsedData.combinedData;
      this.summaryData = parsedData.summaryData;
      this.topNewsData = parsedData.topNewsData;
      this.insightsData = parsedData.insightsData;
      this.formattedTimestamp = (this.combinedData.quote_data.timestamp * 1000).toLocaleString();
    }
    this.fetchWatchlistData();
    this.fetchPortFolioData();
    this.loadInitialData();
    this.submitted = true;
    this.summary();
    

    interval(15000).subscribe(() => {
      this.getCurrentDateTime();
    });

    this.http.get<any>('https://stocksearchon.azurewebsites.net/currentBalance').subscribe(
      (data) => {
        this.balanceAmount = data.currentAmount;
        this.quantityOfStock = data.quantity;
      },
      (error) => {
        console.error('Error fetching current balance:', error);
      }
    );

    setTimeout(() => {
      // this.selectSummaryTab();
      const marketState = this.isMarketOpen();

      if (marketState === 'Market is Open') {
        this.startAutoUpdate();
      }
    }, 50);

    this.refreshSubscription = interval(15000)
      .subscribe(() => {
        this.loadData();
      });
    })
  }

  async fetchWatchlistData() {
    try {
      this.watchlistData = await this.headerService.getwatchlist().toPromise();
      for (const item of this.watchlistData) {
        if (item.profile_data.symbol === this.tickerValue) {
          this.isStarFilled = true;
          break;
        }
        this.isStarFilled = false;
      }
    }
    catch (error) {
      console.error('Error fetching movies:', error);
    }
  }


  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    // console.log('main component contents ', this.mainComponent.tickerInput);
  }

  loadInitialData() {
    // Load initial data such as dateAndtime, balance, and search results
    this.getCurrentDateTime();
    this.loadData();
  }

  loadData() {
    if (this.isMarketOpen() === 'Market is Open') {
      this.search_results(); // Load search results
      this.summary();
    }

  }

  startAutoUpdate() {
    // Start auto-update interval for search_results and summary
    this.refreshSubscription = interval(15000).subscribe(() => {
      this.loadData();
    });
  }

  loadFormattedTimestamp() {
    // Make HTTP request to fetch the formatted timestamp
    this.http.get<any>('https://stocksearchon.azurewebsites.net/?ticker=' + this.tickerValue).subscribe(
      (data) => {
        this.combinedData = data;
        const timestamp = new Date(this.combinedData.quote_data.timestamp * 1000); // Convert to milliseconds
        this.formattedTimestamp = timestamp.toLocaleString(); // Format as YYYY-MM-DD HH:mm:ss

        // After setting the timestamp, you may proceed with other initialization logic
        this.selectSummaryTab();
      },
      (error) => {
        console.error("Error fetching formatted timestamp:", error);
      }
    );
  }

  getCurrentDateTime() {
    this.dateAndtime = moment().format('YYYY-MM-DD HH:mm:ss');
  }

  handleTabChange(event: MatTabChangeEvent): void {
    this.selectedIndex = event.index;

    switch (this.selectedIndex) {
      case 0:
        this.summary();
        break;
      case 1:
        this.topNews();
        break;
      case 2:
        this.charts();
        break;
      case 3:
        this.insights();
        break;
      default:
        break;
    }
  }

  onInput() {
    console.log('input', this.tickerValue);
    this.inputSubject.next(this.tickerValue);
  }

  fetchAutocompleteOptions(input: string) {
    return this.http.get<any>(`https://stocksearchon.azurewebsites.net/autocomplete?input=${input}`);
  }

  clear_results() {
    this.autocompleteOptions = [];
    // Clear sessionStorage
    sessionStorage.removeItem('headerComponentData');
    // Clear component data
    this.tickerValue = '';
    this.submitted = false;
    this.combinedData = null;
    this.summaryData = null;
    this.topNewsData = null;
    this.insightsData = null;
    this.showNoDataMessage = false;
    this.showInvalidTickerMessage = true;
  }

  closeboughtMessage() {
    this.boughtSymbol = '';
  }

  closesoldMessage() {
    this.soldSymbol = '';
  }

  clearMessage() {
    this.submitted = false;
  }

  sell() {
    this.soldSymbol = this.tickerValue;
    if (this.quantity <= 0) {
      return;
    }

    const requestData = {
      company: this.combinedData.profile_data.company_name,
      quantity: -this.quantity,
      total: this.total,
      totalPrice: -this.totalPrice,
      avgPrice: this.totalPrice / this.quantity,
      currentPrice: this.combinedData.quote_data.last_price,
      marketPrice: -(this.combinedData.quote_data.last_price * this.quantity),
      symbol: this.combinedData.profile_data.symbol
    };


    this.http.post<any>('https://stocksearchon.azurewebsites.net/portfolio', requestData)
      .subscribe({
        next: () => {
        },
        error: (error) => {
          console.error('Error selling:', error);
        }
      });
  }

  buy() {
    this.boughtSymbol = this.tickerValue;
    if (this.quantity <= 0) {
      // Handle invalid quantity
      return;
    }
    const totalCost = this.combinedData.quote_data.last_price * this.quantity;
    if (totalCost > this.balanceAmount) {
      // If total cost exceeds balance, display an error message
      this.dialog.closeAll();
      return;
    }

    const requestData = {
      company: this.combinedData.profile_data.company_name,
      quantity: this.quantity,
      total: -totalCost,
      totalPrice: totalCost,
      avgPrice: totalCost / this.quantity,
      currentPrice: this.combinedData.quote_data.last_price,
      marketPrice: this.combinedData.quote_data.last_price * this.quantity,
      symbol: this.combinedData.profile_data.symbol
    };


    this.http.post<any>('https://stocksearchon.azurewebsites.net/portfolio', requestData)
      .subscribe({
        next: () => {
          this.sellButtonActive = true;
        },
        error: (error) => {
          console.error('Error buying:', error);
        }
      });

  }

  getTotal() {
    this.total = this.combinedData.quote_data.last_price * this.quantity;
    this.totalPrice = this.combinedData.quote_data.last_price * this.quantity;
    return this.total;
  }

  clearInvalidTicker() {
    localStorage.setItem('ticker', '')
    this.showInvalidTickerMessage = false;
    this.router.navigateByUrl('/home');

  }

  clearWrongInput() {
    this.showNoDataMessage = false;
  }

  handleEmptyData() {
    this.showNoDataMessage = true;
  }

  openNewsModal(newsItem: any) {
    this.newsmodal = newsItem;
    console.log('url ', this.newsmodal.url, 'headline', this.newsmodal.headline);
    this.DateandTime = new Date(this.newsmodal.datetime * 1000); // Convert Unix timestamp to milliseconds

    // Get the month, day, and year
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(this.DateandTime);
    const day = this.DateandTime.getDate();
    const year = this.DateandTime.getFullYear();

    // Combine them into the desired format
    this.formattedDateAndTime = `${month} ${day}, ${year}`;

    this.dialog.open(this.newsModalRef, {
      width: '80%', // Set the width of the modal
      maxWidth: '800px', // Set the maximum width of the modal
      autoFocus: false // Disable auto focusing on the first form field
    });
  }

  closeNewsModal() {
    this.dialog.closeAll(); // Close all open modals
  }

  selectSummaryTab(): void {
    if (this.tabGroup) {
      this.selectedIndex = 0; // Index of the summary tab
      const fakeEvent = { index: 0 } as MatTabChangeEvent;
      this.handleTabChange(fakeEvent); // Call handleTabChange method with a simulated event
    }
  }

  search_results() {
    console.log('ticker value', this.tickerValue);
    this.summary();
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }

    console.log('triger', this.tickerValue);
    this.fetchWatchlistData()

    this.submitted = true;
    this.http.get<any>(`https://stocksearchon.azurewebsites.net/search?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.combinedData = data;
        console.log('combined: ', this.combinedData);
        const timestamp = new Date(this.combinedData.quote_data.timestamp * 1000); // Convert to milliseconds
        this.formattedTimestamp = timestamp.toLocaleString();

        if (!this.combinedData.profile_data || Object.keys(this.combinedData.profile_data).length === 0) {
          console.log('invalid ticker case');
          this.showInvalidTickerMessage = true;
          this.validTicker = false;
          this.handleEmptyData();
          return;
        }

        this.showInvalidTickerMessage = false;
        this.validTicker = true;

        sessionStorage.setItem('headerComponentData', JSON.stringify({
          tickerValue: this.tickerValue,
          submitted: this.submitted,
          combinedData: this.combinedData,
          summaryData: this.summaryData,
          topNewsData: this.topNewsData,
          insightsData: this.insightsData,
          formattedTimestamp: this.formattedTimestamp
        }));

        
        this.selectSummaryTab();

      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
    this.fetchPortFolioData();
    this.router.navigate(['/search', this.tickerValue]);
  }

  fetchPortFolioData() {
    this.http.get<any>('https://stocksearchon.azurewebsites.net/portfolio').subscribe(
      (data) => {
        this.portfolioData = data;
        console.log('fetched portfolio data: ', this.portfolioData);

        if (Array.isArray(this.portfolioData) && this.portfolioData.length > 0) 
        {
          const foundItem = this.portfolioData.find(item => item.symbol === this.tickerValue);
          if (foundItem != undefined && foundItem.quantity > 0) {
            this.quant = foundItem.quantity;
            console.log('active: ', foundItem.quantity);
            this.sellButtonActive = true;

          }
          else if(foundItem != undefined && foundItem.quantity == 0) 
          {
            console.log('not active: ', foundItem.quantity);
            this.sellButtonActive = false;
          }
          else 
          {
            console.log('not active: ', foundItem.quantity);
            this.sellButtonActive = false;
          }
        }
        else {
          console.log('not active: ');
          this.sellButtonActive = false;
        }
      },
      (error) => {
        console.error('Error fetching portfolio data:', error);
      }
    );
  }

  summary() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }
    this.http.get<any>(`https://stocksearchon.azurewebsites.net/summary?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.summaryData = data;

        if (this.summaryData) {
          this.createhourlyChart(this.summaryData);
        }

      },
      (error) => {
        console.error("Error fetching summary data:", error);
      }
    );
  }

  createhourlyChart(summaryData: any) {
    console.log('this.hpdata: ', this.hpdata)
    this.hpdata = summaryData.hourlyPrices;
    let hourlyData = [];
    let dataLength = this.hpdata.length;

    for (let i = 0; i < dataLength; i++) {
        let timestamp = this.hpdata[i].t;
        let closingPrice = this.hpdata[i].c;
        hourlyData.push([timestamp, closingPrice]);
    }

    this.hourlyChartOptions = {
      chart: 
      {
        backgroundColor: '#f6f6f6' 
      },
        series: [{
            name: null,
            data: hourlyData,
            color: this.combinedData.quote_data.change > 0 ? '#008000' : '#FF0000',
            showInNavigator: true,
            type: 'line',
            tooltip: {
                valueDecimals: 2,
            },
            marker: {
                enabled: false // Disable markers
            }
        }],
        title: { text: this.tickerValue + ' Hourly Price Variation' },
        yAxis: [{
            opposite: true,
            labels: {
                align: 'right'
            }
        }],
        rangeSelector: {
            enabled: false,
        },
        navigator: {
            series: {
                type: 'area',
                color: '#f6f6f6',
                fillOpacity: 1,
            },
        },
        xAxis: {
            type: 'datetime',
            labels: {
              formatter: function (this: any) {
                if (this.value !== undefined) {
                    return Highcharts.dateFormat('%H:%M', this.value); // Format timestamp to display hours and minutes
                }
                return '';
            }
            }
        },
        time: {
            getTimezoneOffset: Addtime,
        },
        legend: {
            enabled: false
        }
    };
}


  topNews() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }
    this.http.get<any>(`https://stocksearchon.azurewebsites.net/topnews?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.topNewsData = data; // Assign response data to topNewsData property
        console.log('news: ', this.topNewsData)
      },
      (error) => {
        console.error("Error fetching top news data:", error);
      }
    );
  }

  charts() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }
    this.http.get<any>(`https://stocksearchon.azurewebsites.net/charts?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.createChart(data);

      },
      (error) => {
        console.error("Error fetching charts data:", error);
      }
    );
  }

  createChart(data: any) {
    // Split the data set into ohlc and volume
    const ohlc = [], volume = [];
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i += 1) {
      ohlc.push([
        data[i]['t'], // the date
        data[i]['o'], // open
        data[i]['h'], // high
        data[i]['l'], // low
        data[i]['c'] // close
      ]);

      volume.push([
        data[i]['t'], // the date
        data[i]['v'] // the volume
      ]);
    }

    // Create the chart
    Highstockcharts.stockChart('charts-container', {
      chart: {
        backgroundColor: '#f6f6f6' // Set background color here
      },
      rangeSelector: {
        selected: 2
      },
      title: {
        text: this.tickerValue + ' Historical'
      },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },
      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true
        }
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],
      tooltip: {
        split: true
      },
      plotOptions: {
        series: {
          dataGrouping: {
            units: [
              ['week', [1]], // unit name, allowed multiples
              ['month', [1, 2, 3, 4, 6]]
            ]
          }
        }
      },
      series: [{
        type: 'candlestick',
        name: this.tickerValue,
        id: this.tickerValue,
        zIndex: 2,
        data: ohlc
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: volume,
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: this.tickerValue,
        params: {
          volumeSeriesID: 'volume'
        },
        dataLabels: {
          enabled: false
        },
        zoneLines: {
          enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: this.tickerValue,
        zIndex: 1,
        marker: {
          enabled: false
        }
      }]
    });
  }

  insights() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }
    this.http.get<any>(`https://stocksearchon.azurewebsites.net/insights?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.insightsData = data;

        this.chartOptions = {
          chart: {
            type: 'column',
            backgroundColor: '#f6f6f6'
          },
          title: {
            text: 'Recommendation Trends'
          },
          xAxis: {
            categories: [this.insightsData.Recent_Four_Months_Trends[0].period,
            this.insightsData.Recent_Four_Months_Trends[1].period,
            this.insightsData.Recent_Four_Months_Trends[2].period,
            this.insightsData.Recent_Four_Months_Trends[3].period],
          },
          yAxis: {
            min: 0,
            title: {
              text: '#Analysis',
              align: 'middle',
            },
            labels: {
              overflow: 'justify'
            }
          },
          tooltip: {
            valueSuffix: ''
          },
          plotOptions: {
            column: {
              dataLabels: {
                enabled: true
              }
            },
            series: {
              stacking: 'normal'
            }
          },
          credits: {
            enabled: false
          },
          series: [
            {
              name: 'Strong Buy',
              data: [this.insightsData.Recent_Four_Months_Trends[0].strong_buy,
              this.insightsData.Recent_Four_Months_Trends[1].strong_buy,
              this.insightsData.Recent_Four_Months_Trends[2].strong_buy,
              this.insightsData.Recent_Four_Months_Trends[3].strong_buy],
              color: '#1a6334'
            },
            {
              name: 'Buy',
              data: [this.insightsData.Recent_Four_Months_Trends[0].buy,
              this.insightsData.Recent_Four_Months_Trends[1].buy,
              this.insightsData.Recent_Four_Months_Trends[2].buy,
              this.insightsData.Recent_Four_Months_Trends[3].buy],
              color: '#25af51'
            },
            {
              name: 'Hold',
              data: [this.insightsData.Recent_Four_Months_Trends[0].hold,
              this.insightsData.Recent_Four_Months_Trends[1].hold,
              this.insightsData.Recent_Four_Months_Trends[2].hold,
              this.insightsData.Recent_Four_Months_Trends[3].hold],
              color: '#b17e29'
            },
            {
              name: 'Sell',
              data: [this.insightsData.Recent_Four_Months_Trends[0].sell,
              this.insightsData.Recent_Four_Months_Trends[1].sell,
              this.insightsData.Recent_Four_Months_Trends[2].sell,
              this.insightsData.Recent_Four_Months_Trends[3].sell],
              color: '#f15053'
            },
            {
              name: 'Strong Sell',
              data: [this.insightsData.Recent_Four_Months_Trends[0].strong_sell,
              this.insightsData.Recent_Four_Months_Trends[1].strong_sell,
              this.insightsData.Recent_Four_Months_Trends[2].strong_sell,
              this.insightsData.Recent_Four_Months_Trends[3].strong_sell],
              color: '#752b2c'
            }
          ]
        };

        // Calculate the range of values
        const min = Math.min(
          this.insightsData.HistoricalData[0].actual,
          this.insightsData.HistoricalData[1].actual,
          this.insightsData.HistoricalData[2].actual,
          this.insightsData.HistoricalData[3].actual,
          this.insightsData.HistoricalData[0].estimate,
          this.insightsData.HistoricalData[1].estimate,
          this.insightsData.HistoricalData[2].estimate,
          this.insightsData.HistoricalData[3].estimate
        );

        const max = Math.max(
          this.insightsData.HistoricalData[0].actual,
          this.insightsData.HistoricalData[1].actual,
          this.insightsData.HistoricalData[2].actual,
          this.insightsData.HistoricalData[3].actual,
          this.insightsData.HistoricalData[0].estimate,
          this.insightsData.HistoricalData[1].estimate,
          this.insightsData.HistoricalData[2].estimate,
          this.insightsData.HistoricalData[3].estimate
        );

        // Calculate the tick interval
        const tickInterval = (max - min) / 4;

        // Set the options for the historical chart
        this.historicalChartOptions = {
          chart: {
            type: 'spline',
            marginRight: 10,
            backgroundColor: '#f6f6f6'
          },
          title: {
            text: 'Historical EPS Surprises'
          },
          xAxis: {
            categories: [this.insightsData.HistoricalData[0].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[0].surprise,
            this.insightsData.HistoricalData[1].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[1].surprise,
            this.insightsData.HistoricalData[2].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[2].surprise,
            this.insightsData.HistoricalData[3].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[3].surprise]
          },
          yAxis: {
            title: {
              text: 'Quarterly EPS'
            },
            min: min,
            max: max,
            tickInterval: tickInterval,
            labels: {
              format: '{value:.2f}'
            },
            endOnTick: false
          },
          plotOptions: {
            spline: {
              marker: {
                enabled: true
              }
            }
          },
          legend: {
            enabled: true
          },
          exporting: {
            enabled: false
          },
          series: [
            {
              name: 'Actual',
              data: [this.insightsData.HistoricalData[0].actual,
              this.insightsData.HistoricalData[1].actual,
              this.insightsData.HistoricalData[2].actual,
              this.insightsData.HistoricalData[3].actual]
            },
            {
              name: 'Estimate',
              data: [this.insightsData.HistoricalData[0].estimate,
              this.insightsData.HistoricalData[1].estimate,
              this.insightsData.HistoricalData[2].estimate,
              this.insightsData.HistoricalData[3].estimate]
            }
          ]
        };


      },
      (error) => {
        console.error("Error fetching insights data:", error);
      }
    );
  }

  toggleStar() {
    this.watchlistservice.updateTicker(this.tickerValue);
    this.isStarFilled = !this.isStarFilled;

    if (this.isStarFilled && this.combinedData) {
      this.sendDataToBackend();
    }
    else {
      this.deleteDataToBackend();
    }
  }

  async sendDataToBackend() {
    try {

      const response = await this.http.post<any>('https://stocksearchon.azurewebsites.net/watchlist', this.combinedData).toPromise();
    }
    catch (error) {
      console.error('Error sending data to backend:', error);
    }
  }

  async deleteDataToBackend() {
    try {

      let tempId: string | undefined;
      for (const item of this.watchlistData) {
        if (item.profile_data.symbol === this.tickerValue) {
          tempId = item._id;
          break;
        }
      }

      if (tempId) {
        const response = await this.http.delete<any>(`https://stocksearchon.azurewebsites.net/watchlist/${tempId}`).toPromise();
      } else {
        console.error('No item found in watchlist with the specified tickerValue');
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  }


  buystock(action: string) {
    this.buysellaction = action;
    if (!this.combinedData || !this.combinedData.quote_data || !this.combinedData.profile_data) {
      console.error("Data not available to perform buy transaction");
      return;
    }
  }

  checkTotal() {
    const totalCost = this.combinedData.quote_data.last_price * this.quantity;
    this.totalExceedsBalance = totalCost > this.balanceAmount;
    this.notEnoughStocks = this.quantity > this.quant;
  }

  sellstock(action: string) {
    this.buysellaction = action;
    if (!this.combinedData || !this.combinedData.quote_data || !this.combinedData.profile_data) {
      console.error("Data not available to perform sell transaction");
      return;
    }
  }

  isMarketOpen() {
    const currentTimestamp = Date.now(); // Get current timestamp

    // Get the timestamp from combinedData or default to null
    const quoteTimestamp = this.combinedData?.quote_data?.timestamp || null;

    // If quoteTimestamp is null or undefined, return "Market is Closed"
    if (!quoteTimestamp) {
      return 'Market is Closed';
    }

    // Calculate the time difference between current time and the timestamp from combinedData
    const timeDifference = currentTimestamp - (quoteTimestamp * 1000);

    // Define the threshold for considering the market open (in milliseconds)
    const marketOpenThreshold = 5 * 60 * 1000; // 5 minutes

    if (timeDifference <= marketOpenThreshold) {
      // Market is open if the time difference is less than or equal to the threshold
      return 'Market is Open';
    } else {
      // Market is closed if the time difference exceeds the threshold
      // Format the timestamp to display
      const formattedTimestamp = new Date(quoteTimestamp * 1000).toLocaleString();
      return 'Market Closed on ' + formattedTimestamp;
    }
  }
}

function Addtime(timestamp: any) {
  var zone = 'America/Los_Angeles',
    timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

  return timezoneOffset;
}

