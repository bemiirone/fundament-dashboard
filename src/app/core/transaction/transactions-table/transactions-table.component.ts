import { Component, OnInit} from '@angular/core';
import { ExtendedTransaction } from '../transaction.interface';
import { TransactionService } from '../transaction.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TransactionsCreateComponent } from '../transaction-create/transaction-create.component';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent{

  transactions$: Observable<ExtendedTransaction[]>;
  constructor(private transactionService: TransactionService, private dialog: MatDialog) {
    this.transactions$ = this.transactionService.getEnhancedTransactions();
  }
  

  openCreateTransactionModal() {
    const dialogRef = this.dialog.open(TransactionsCreateComponent, {
      width: '400px', 
    });
  }
}

