import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  period: string;
  maxDate: Date = new Date();
  toMinDate: Date;

  quotes$ = this.priceQuery.priceQueries$;

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      from: [null, Validators.required],
      to: [null, Validators.required],
    });
  }

  ngOnInit() {}

  get symbol() {
    return this.stockPickerForm.get('symbol');
  }

  get fromDate() {
    return this.stockPickerForm.get('from');
  }

  get toDate() {
    return this.stockPickerForm.get('to');
  }

  fromDateFilter(d: Date | null): boolean {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }

  setToMinDate() {
    this.toMinDate = new Date(this.fromDate.value);
  }

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const symbol  = this.symbol.value;
      const period = (this.toDate.value.getTime() - this.fromDate.value.getTime()) / (1000 * 3600 * 24);
      this.priceQuery.fetchQuote(symbol, `${period + 1}d`);
    }
  }
}
