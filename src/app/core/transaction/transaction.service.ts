import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ExtendedTransaction, Transaction, TransactionCreate } from './transaction.interface';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NestedBankAccount } from '../bank-account/bank-account.interface';
import { BankAccountService } from '../bank-account/bank-account.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {

  private apiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient, private bankAccountService: BankAccountService) {}

  getTransactions() {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  createTransaction(data: TransactionCreate) {
    console.log(data);
    return this.http.post<Transaction>(this.apiUrl, data)
      .pipe(
        catchError((error: any) => {
          console.error('HTTP POST Request Error:', error);
          return throwError(error);
        })
      );
  }

  getEnhancedTransactions(): Observable<ExtendedTransaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}`).pipe(
      switchMap((transactions: Transaction[]) => {
        return this.bankAccountService.getBankAccounts().pipe(
          map((bankAccounts) => {
            return transactions.map((transaction: Transaction) => {
              const extendedTransaction: ExtendedTransaction = {
                id: transaction.id,
                transaction_type: transaction.transaction_type,
                amount: transaction.amount,
                source_bank_account_id: transaction.source_bank_account_id,
                target_bank_account_id: transaction.target_bank_account_id,
                description: transaction.description,
                source: {} as NestedBankAccount,
                target: {} as NestedBankAccount,
              };

              // If source_bank_account_id is available, set the source property
              if (transaction.source_bank_account_id !== null) {
                extendedTransaction.source = bankAccounts.find(
                  (account) => account.id === transaction.source_bank_account_id
                ) || {} as NestedBankAccount;
              }

              // If target_bank_account_id is available, set the target property
              if (transaction.target_bank_account_id !== null) {
                extendedTransaction.target = bankAccounts.find(
                  (account) => account.id === transaction.target_bank_account_id
                ) || {} as NestedBankAccount;
              }

              return extendedTransaction;
            });
          }),
          catchError((error) => {
            // Handle errors from the bank account service
            console.error('Error fetching bank accounts:', error);
            return throwError('Error fetching bank accounts');
          })
        );
      }),
      catchError((error) => {
        // Handle errors from the HTTP request
        console.error('Error fetching transactions:', error);
        return throwError('Error fetching transactions');
      })
    );
  }
}