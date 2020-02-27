import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit, OnDestroy {
  private quotesSubscription: Subscription;
  private filteredQuotes;
  private quotes$ = this.priceQuery.priceQueries$;
  
  stockPickerForm: FormGroup;
  period: string;
  maxDate: Date = new Date();
  toMinDate: Date;
  filteredQuotes$ = new Subject<any>();

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      from: [null, Validators.required],
      to: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.quotesSubscription = this.quotes$.subscribe((data: any[]) => {
      if (data) {
        this.filteredQuotes = data.filter(quote => {
          const quoteDate = new Date(quote[0]);
          return (
            quoteDate.getTime() >= this.fromDate.value.getTime() &&
            quoteDate.getTime() <= ( this.toDate.value.getTime() + ((1000 * 3600 * 24)))
          );
        });
        if (this.filteredQuotes.length > 0) {
          this.filteredQuotes$.next(this.filteredQuotes);
        }
      }
    });
  }

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
      const symbol = this.symbol.value;
      const period = 'max';
      this.priceQuery.fetchQuote(symbol, period);
    }
  }
  ngOnDestroy() {
    if (this.quotesSubscription) {
      this.quotesSubscription.unsubscribe();
    }
    this.filteredQuotes$.unsubscribe();
  }
}
