import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Fallback implementation of sessionStorage
const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

@Component({
  selector: 'app-portfolio',
  standalone: true, 
  imports: [NgClass, ReactiveFormsModule, FormsModule, NgIf, HttpClientModule, CommonModule, TransactionDialogComponent, NgbModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})

export class PortfolioComponent implements OnInit {
  portfolioData: any = [];
  currentAmount: any;
  balanceAmount: any;
  quantityOfStock: any;
  combinedData: any;
  boughtSymbol: string = '';
  soldSymbol: string = '';

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.fetchPortfolioData();
    this.fetchCurrentBalance();
  }

  closeboughtMessage() {
    this.boughtSymbol = '';
  }

  closesoldMessage() {
    this.soldSymbol = '';
  }

  isAllStocksQuantityOneOrLess(): boolean {
    return this.portfolioData.every((item: { quantity: number; }) => item.quantity <= 1);
  }

  fetchPortfolioData() {
    this.http.get<any>('/portfolio').subscribe(
      (data) => {
        this.portfolioData = data;
      },
      (error) => {
        console.error('Error fetching portfolio data:', error);
      }
    );
  }

  fetchCurrentBalance() {
    this.http.get<any>('/currentBalance').subscribe(
      (data) => {
        this.currentAmount = data.currentAmount;
        this.quantityOfStock = data.quantity;
      },
      (error) => {
        console.error('Error fetching current balance:', error);
      }
    );
  }

  buyStock(symbol: string) {

    if (!symbol) {
      console.error("Ticker value is required");
      return;
    }

    this.http.get<any>(`/?ticker=${symbol}`).subscribe(
      (data) => {
        this.combinedData = data;
        // Store the search results in sessionStorage
        sessionStorage.setItem('portfolioComponentData', JSON.stringify({
          combinedData: this.combinedData
        }));
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
          this.boughtSymbol = symbol;
          this.ngOnInit()
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }

  sellStock(symbol: string) {

    if (!symbol) {
      console.error("Ticker value is required");
      return;
    }

    this.http.get<any>(`/?ticker=${symbol}`).subscribe(
      (data) => {
        this.combinedData = data;
        // Store the search results in sessionStorage
        sessionStorage.setItem('portfolioComponentData', JSON.stringify({
          combinedData: this.combinedData
        }));
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
          this.soldSymbol = symbol;
          this.ngOnInit()
        });
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }

  openTransactionDialog(action: string) {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: {
        action: action,
        balance: this.balanceAmount,
        company: this.combinedData.profile_data.company_name,
        quantity: this.quantityOfStock,
        symbol: this.combinedData.profile_data.symbol,
        currentPrice: this.combinedData.quote_data.last_price
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.fetchPortfolioData(); // Refresh portfolio data after dialog is closed
    });
  }
}