import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  StocksAppConfig,
  StocksAppConfigToken
} from '@coding-challenge/stocks/data-access-app-config';
import { Effect } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';
import { map } from 'rxjs/operators';
import {
  FetchPriceQuery,
  PriceQueryActionTypes,
  PriceQueryFetched,
  PriceQueryFetchError
} from './price-query.actions';
import { PriceQueryPartialState } from './price-query.reducer';
import { PriceQueryResponse } from './price-query.type';
import { of } from 'rxjs';

@Injectable()
export class PriceQueryEffects {
  private cachedData = new Map<string, PriceQueryResponse[]>();
  @Effect() loadPriceQuery$ = this.dataPersistence.fetch(
    PriceQueryActionTypes.FetchPriceQuery,
    {
      run: (action: FetchPriceQuery, state: PriceQueryPartialState) => {
        const endPoint = `${this.env.apiURL}/beta/stock/${action.symbol}/chart/${action.period}?token=${this.env.apiKey}`;
        if (this.cachedData.get(endPoint)) {
          return of(new PriceQueryFetched(this.cachedData.get(endPoint)));
        } else {
        return this.httpClient
          .get(endPoint)
          .pipe(
            map(resp => {
              this.cachedData.set(endPoint, resp as PriceQueryResponse[]);
              return new PriceQueryFetched(resp as PriceQueryResponse[]);
            }
          ));
        }
      },

      onError: (action: FetchPriceQuery, error) => {
        return new PriceQueryFetchError(error);
      }
    }
  );

  constructor(
    @Inject(StocksAppConfigToken) private env: StocksAppConfig,
    private httpClient: HttpClient,
    private dataPersistence: DataPersistence<PriceQueryPartialState>
  ) {}
}
