import { Component, NgModule, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { NgForm } from '@angular/forms';
import { NewsModalComponent } from '../news-modal/news-modal.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
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

// Fallback implementation of sessionStorage
const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { }
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FormsModule, NgIf, HttpClientModule, CommonModule,
    MatInputModule, MatFormFieldModule, MatAutocompleteModule, MatTabsModule,
    HighchartsChartModule,],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements AfterViewInit, OnInit {
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

  @ViewChild('stockForm') stockForm!: NgForm;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  private inputSubject = new Subject<string>();
  chartOptions: any;
  historicalChartOptions: any;
  formattedDateTime: any;
  
  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.inputSubject.pipe(
      debounceTime(300), // wait for 300ms after the last keystroke
      distinctUntilChanged(), // only emit if the current value is different from the last
      switchMap(input => this.fetchAutocompleteOptions(input)) // fetch autocomplete options
    ).subscribe(options => {
      if (options && options.result && Array.isArray(options.result)) {
        this.autocompleteOptions = options.result.slice(0, 5).map((item: any) => ({
          symbol: item.symbol,
          description: item.description
        }));
      } else {
        console.error('Invalid response format:', options);
        // Handle the error or empty response here
        this.autocompleteOptions = [];
      }
    });
  }

  ngOnInit() {

    this.loadData();

    this.http.get<any>('http://localhost:5172/currentBalance').subscribe(
      (data) => {
        this.balanceAmount = data.currentAmount;
        this.quantityOfStock = data.quantity;
      },
      (error) => {
        console.error('Error fetching current balance:', error);
      }
    );

    // Retrieve data from sessionStorage if available
    const storedData = sessionStorage.getItem('headerComponentData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.tickerValue = parsedData.tickerValue;
      this.submitted = parsedData.submitted;
      this.combinedData = parsedData.combinedData;
      this.summaryData = parsedData.summaryData;
      this.topNewsData = parsedData.topNewsData;
      this.insightsData = parsedData.insightsData;
      this.formattedTimestamp = this.formatTimestamp(this.combinedData.quote_data.timestamp);
    }

    setTimeout(() => 
    {
      this.selectSummaryTab();
    }, 50);

      this.refreshSubscription = interval(15000) 
          .subscribe(() => 
          {
              this.loadData(); 
          });

  }

  ngOnDestroy() {
    // Unsubscribe from the refresh interval when component is destroyed
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    // Initialize Highcharts modules after the view has been initialized
    this.initializeHighcharts();
  }

  loadData() 
  {
    if(this.isMarketOpen() === 'Market is Open') 
    {
      this.search_results(); 
      this.summary();
    }
    else 
    {
      this.getCurrentDateTime();
    }
  }

  private async initializeHighcharts(): Promise<void> {
    await import('highcharts/highstock'); // Import Highcharts core
    await import('highcharts/indicators/indicators'); // Import Highcharts indicators
    await import('highcharts/modules/drag-panes'); // Import drag panes module
    await import('highcharts/modules/exporting'); // Import exporting module
    await import('highcharts/modules/accessibility'); // Import accessibility module
    await import('highcharts/indicators/volume-by-price'); // Import Volume by Price indicator

    // Initialize Highcharts after all modules are loaded
    HC_indicators(Highstockcharts);
    HC_VBP(Highstockcharts);
    HC_dragPanes(Highstockcharts);
    HC_exporting(Highstockcharts);
    HC_accessibility(Highstockcharts);
  }

  getCurrentDateTime() 
  {
    this.formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log('Current date and time is:', this.formattedDateTime);
  }

  handleTabChange(event: MatTabChangeEvent): void {
    const selectedIndex = event.index;

    switch (selectedIndex) {
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
    this.inputSubject.next(this.tickerValue);
  }

  fetchAutocompleteOptions(input: string) {
    return this.http.get<any>(`http://localhost:5172/autocomplete?input=${input}`);
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
    this.stockForm.resetForm();
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

  clearInvalidTicker() {
    this.stockForm.resetForm(); // Reset the form
    this.showInvalidTickerMessage = false; // Hide the message
  }

  clearWrongInput() {
    this.showNoDataMessage = false; // Hide the message
  }

  handleEmptyData() {
    this.showNoDataMessage = true;
  }

  openNewsModal(newsItem: any) {
    const dialogRef = this.dialog.open(NewsModalComponent, {
      data: {
        datetime: newsItem.datetime,
        summary: newsItem.summary,
        source: newsItem.source,
        headline: newsItem.headline,
        url: newsItem.url
      }
    });
  }

  selectSummaryTab(): void {
    console.log('displaying summary data once again');
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = 0; // Index of the summary tab
      const fakeEvent = { index: 0 } as MatTabChangeEvent;
      this.handleTabChange(fakeEvent); // Call handleTabChange method with a simulated event
    }
  }

  search_results() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }

    this.submitted = true;
    this.http.get<any>(`http://localhost:5172/?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.combinedData = data;

        // Extract and format the timestamp
        const timestamp = new Date(this.combinedData.quote_data.timestamp * 1000); // Convert to milliseconds
        this.formattedTimestamp = timestamp.toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:mm:ss

        if (!this.combinedData.profile_data || Object.keys(this.combinedData.profile_data).length === 0) {
          this.handleEmptyData();
          return;
        }

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
  }

  summary() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }

    this.http.get<any>(`http://localhost:5172/summary?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.summaryData = data; // Store summary data in the variable
        console.log('summarydata;: ', this.summaryData);
      },
      (error) => {
        console.error("Error fetching summary data:", error);
      }
    );
  }

  topNews() {
    if (!this.tickerValue) {
      console.error("Ticker value is required");
      return;
    }
    this.http.get<any>(`http://localhost:5172/topnews?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.topNewsData = data; // Assign response data to topNewsData property
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
    this.http.get<any>(`http://localhost:5172/charts?ticker=${this.tickerValue}`).subscribe(
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
      rangeSelector: {
        selected: 2
      },
      title: {
        text: 'AAPL Historical'
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
        name: 'AAPL',
        id: 'aapl',
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
        linkedTo: 'aapl',
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
        linkedTo: 'aapl',
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
    this.http.get<any>(`http://localhost:5172/insights?ticker=${this.tickerValue}`).subscribe(
      (data) => {
        this.insightsData = data;

        this.chartOptions = {
          chart: {
            type: 'column'
          },
          title: {
            text: 'Recommendation Trends'
          },
          legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 250,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: '#f6f6f6',
            shadow: true
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
              align: 'high'
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

        this.historicalChartOptions = {         
          chart : {
             type: 'spline',
             marginRight: 10
          },
          title : {
             text: 'Historical EPS Surprises'   
          },   
          xAxis : {
             categories: [this.insightsData.HistoricalData[0].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[0].surprise, 
                          this.insightsData.HistoricalData[1].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[1].surprise, 
                          this.insightsData.HistoricalData[2].period + '<br>' + 'Surprise: ' + this.insightsData.HistoricalData[2].surprise, 
                          this.insightsData.HistoricalData[3].period + '<br>' + 'Surprise: ' +this.insightsData.HistoricalData[3].surprise]
          },
          yAxis : {
             title: {
                text: 'Quarterly EPS'
             },
             min: 1,
             max: 2.25,
             tickInterval: 0.25
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
          exporting : {
             enabled: false
          },
          series : [
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
    this.isStarFilled = !this.isStarFilled;

    if (this.isStarFilled && this.combinedData) {
      this.sendDataToBackend();
    }
  }

  sendDataToBackend() {
    // Send the combinedData to the backend with route '/watchlist'
    this.http.post<any>('http://localhost:5172/watchlist', this.combinedData).subscribe(
      (response) => {
        console.log("Data sent to backend successfully:", response);
      },
      (error) => {
        console.error("Error sending data to backend:", error);
      }
    );
  }

  buystock() {
    if (!this.combinedData || !this.combinedData.quote_data || !this.combinedData.profile_data) {
      console.error("Data not available to perform buy transaction");
      return;
    }
    console.log('combineddata: ', this.combinedData);
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: {
        balance: this.balanceAmount,
        company: this.combinedData.profile_data.company_name,
        quantity: this.quantityOfStock,
        symbol: this.combinedData.profile_data.symbol,
        currentPrice: this.combinedData.quote_data.last_price,
        action: 'buy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.boughtSymbol = this.combinedData.profile_data.symbol;
    });
  }

  sellstock() {
    if (!this.combinedData || !this.combinedData.quote_data || !this.combinedData.profile_data) {
      console.error("Data not available to perform sell transaction");
      return;
    }

    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: {
        balance: this.balanceAmount,
        company: this.combinedData.profile_data.company_name,
        quantity: this.quantityOfStock,
        symbol: this.combinedData.profile_data.symbol,
        currentPrice: this.combinedData.quote_data.last_price,
        action: 'sell'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.soldSymbol = this.combinedData.profile_data.symbol;
    });
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
  }

  isMarketOpen() {
    // Get the current timestamp
    const currentTimestamp = new Date().getTime();

    // Parse the formatted timestamp and convert it to a timestamp
    const formattedTimestamp = new Date(this.formattedTimestamp).getTime();

    // Check if the current time is the same as the formatted timestamp
    if (currentTimestamp === formattedTimestamp) {
      return 'Market is Open';
    } else {
      return 'Market Closed on ' + this.formattedTimestamp;
    }
  }

}