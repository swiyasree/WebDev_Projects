import { Component, Inject, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'bootstrap';

@Component({
  standalone: true,
  selector: 'app-transaction-dialog',
  imports: [
    FormsModule,
    MatFormFieldModule,
    HttpClientModule,
    NgClass,
    NgIf,
    MatInputModule,
    NgbModule
  ],
  templateUrl: './transaction-dialog.component.html',
})
export class TransactionDialogComponent {
  quantity: number = 0;
  total: number = 0;
  balanceAmount = 0;
  totalPrice = 0;
  totalExceedsBalance: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  getTotal(): number {
    this.total = this.data.currentPrice * this.quantity;
    this.totalPrice = this.data.currentPrice * this.quantity;
    return this.total;
  }

  checkTotal() {
    const totalCost = this.data.currentPrice * this.quantity;
    this.totalExceedsBalance = totalCost > this.data.balance;
  }

  buy() {
    if (this.quantity <= 0) {
      // Handle invalid quantity
      return;
    }

    const totalCost = this.data.currentPrice * this.quantity;
    if (totalCost > this.data.balance) {
      // If total cost exceeds balance, display an error message
      this.dialogRef.close('Not enough money in wallet.');
      return;
    }
  
    const requestData = {
      company: this.data.company,
      quantity: this.quantity,
      total: -totalCost, 
      totalPrice: totalCost,
      avgPrice: totalCost / this.quantity,
      currentPrice: this.data.currentPrice,
      marketPrice: this.data.currentPrice * this.quantity,
      symbol: this.data.symbol
    };
    // Call backend API to buy
    this.http.post<any>('stocksearchon.azurewebsites.net/portfolio', requestData)
      .subscribe({
        next: () => {
          this.dialogRef.close();
        },
        error: (error) => {
          // Handle error
          console.error('Error buying:', error);
          // You can show an error message to the user
        }
      });
}

performAction(): void {
  if (this.data.action === 'buy') {
    this.buy();
  } else if (this.data.action === 'sell') {
    this.sell();
  }
}

  
  sell() {
    if (this.quantity <= 0) {
      // Handle invalid quantity
      return;
    }
  
    const requestData = {
      company: this.data.company,
      quantity: -this.quantity,
      total: this.total, 
      totalPrice: -this.totalPrice,
      avgPrice: this.totalPrice/this.quantity,
      currentPrice: this.data.currentPrice,
      marketPrice: -(this.data.currentPrice * this.quantity),
      symbol: this.data.symbol
    };
  
    // Call backend API to sell
    this.http.post<any>('stocksearchon.azurewebsites.net/portfolio', requestData)
      .subscribe({
        next: () => {
          this.dialogRef.close();
        },
        error: (error) => {
          // Handle error
          console.error('Error selling:', error);
          // You can show an error message to the user
        }
      });
  }
  
  
}
