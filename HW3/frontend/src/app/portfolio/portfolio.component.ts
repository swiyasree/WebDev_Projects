import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'bootstrap';
import { Stock} from './test';

// Fallback implementation of sessionStorage
const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

@Component({
  selector: 'app-portfolio',
  standalone: true, 
  imports: [NgClass, MatInputModule, MatFormFieldModule, ReactiveFormsModule, FormsModule, NgIf, HttpClientModule, CommonModule, TransactionDialogComponent, NgbModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})

export class PortfolioComponent implements OnInit {

  portfolioData: any = [];
  currentAmount: any;
  balanceAmount: any;
  quantityOfStock: any;
  combinedData: any;
  buysellmodal: any;
  boughtSymbol: string = '';
  soldSymbol: string = '';
  isMobileView: boolean = false;
  quantity: number = 0;
  total: number = 0;
  totalPrice = 0;
  totalExceedsBalance: boolean = false;
  item: any;
  dataLoaded: boolean = false;
  newportfolioData: any;
  ticker: any;
  dictionary: { [key: string]: Stock } = {};
  company: any;
  currentPrice: any;
  calcCost: any;
  buysellaction: any;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.checkMobileView();
    this.fetchPortfolioData();
    this.fetchCurrentBalance();
  }
  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
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
    this.http.get<any>('http://localhost:5172/portfolio').subscribe(
      (data) => {
        
        this.portfolioData = data;
        
        for (const item of this.portfolioData) 
        {
          this.dictionary[item.symbol] = item;
        }
        console.log('dict: ', this.dictionary);
      },

      (error) => {
        console.error('Error fetching portfolio data:', error);
      }
    );
  }

  fetchtickerData(symbolticker: string) {
    return this.http.get<any>(`http://localhost:5172/?ticker=${symbolticker}`);
  }

  fetchCurrentBalance() {
    this.http.get<any>('http://localhost:5172/currentBalance').subscribe(
      (data) => {
        this.currentAmount = data.currentAmount;
        this.quantityOfStock = data.quantity;
      },
      (error) => {
        console.error('Error fetching current balance:', error);
      }
    );
  }

  buyStock(symbolticker: string, action: string) {
    this.buysellaction = action;
    this.ticker = this.dictionary[symbolticker].symbol;
    this.currentPrice = this.dictionary[symbolticker].currentPrice;

    if (!symbolticker) 
    {
      console.error("Ticker value is required");
      return;
    }
  }

  sellStock(symbolticker: string, action: string) 
  {
    this.buysellaction = action;
    this.ticker = this.dictionary[symbolticker].symbol;
    this.currentPrice = this.dictionary[symbolticker].currentPrice;

    if (!symbolticker) {
      console.error("Ticker value is required");
      return;
    }
  }

  sell(symbolticker : string) 
  {
    if (this.quantity <= 0) {
      return;
    }

    console.log('ticker: ', symbolticker, ' ', this.dictionary);
  
    const requestData = {
      company: this.dictionary[symbolticker].company,
      quantity: -this.quantity,
      total: this.total, 
      totalPrice: -this.totalPrice,
      avgPrice: this.totalPrice/this.quantity,
      currentPrice: this.dictionary[symbolticker].currentPrice,
      marketPrice: -(this.dictionary[symbolticker].currentPrice * this.quantity),
      symbol: this.dictionary[symbolticker].symbol
    };

    console.log('requestdata', requestData);
  
    this.http.post<any>('http://localhost:5172/portfolio', requestData)
      .subscribe({
        next: () => {

        },
        error: (error) => {
          console.error('Error selling:', error);
        }
      });
      this.ngOnInit();
  }
  
  buy(symbolticker: string) 
  {
    if (this.quantity <= 0) {
      // Handle invalid quantity
      return;
    }
      const totalCost = this.calcCost * this.quantity;
      if (totalCost > this.currentAmount) {
        this.dialog.closeAll();
        return;
      }
    
      const requestData = {
        company: this.dictionary[symbolticker].company,
        quantity: this.quantity,
        total: -totalCost, 
        totalPrice: totalCost,
        avgPrice: totalCost / this.quantity,
        currentPrice: this.dictionary[symbolticker].currentPrice,
        marketPrice: this.dictionary[symbolticker].currentPrice * this.quantity,
        symbol: this.dictionary[symbolticker].symbol
      };

      console.log('requestdata', requestData);
      
      this.http.post<any>('http://localhost:5172/portfolio', requestData)
        .subscribe({
          next: () => {
          },
          error: (error) => {
            console.error('Error buying:', error);
          }
        });
        this.ngOnInit();
  }

    checkTotal(symbolticker: string) 
    {
      const totalCost = this.dictionary[symbolticker].currentPrice * this.quantity;
      this.calcCost = this.dictionary[symbolticker].currentPrice;
      this.totalExceedsBalance = totalCost > this.currentAmount;
      return this.totalExceedsBalance;
    }

    getTotal() 
    {
      this.total = this.calcCost * this.quantity;
      this.totalPrice = this.calcCost * this.quantity;
      return this.total;
    }

}