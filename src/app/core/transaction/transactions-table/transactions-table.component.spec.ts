import { TestBed, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
import { TransactionsTableComponent } from './transactions-table.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransactionsCreateComponent } from '../transaction-create/transaction-create.component';
import { TransactionService } from '../transaction.service';
import { ExtendedTransaction, TransactionType } from '../transaction.interface';

fdescribe('TransactionsTableComponent', () => {
  let component: TransactionsTableComponent;
  let fixture: ComponentFixture<TransactionsTableComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let httpMock: HttpTestingController;
  let transactionService: jasmine.SpyObj<TransactionService>;

  const mockTransactions: ExtendedTransaction[] = [{
    id: 1,
    transaction_type: TransactionType.TRANSFER,
    amount: 100.0,
    source_bank_account_id:1,
    target_bank_account_id: 1,
    description: 'Transfer from Account 1 to Account 2',
    source: {
      bank_name: 'Bank A',
      account_holder_name: 'John Doe',
      sort_code: '123456',
      account_number: '78901234',
    },
    target: {
      bank_name: 'Bank B',
      account_holder_name: 'Jane Smith',
      sort_code: '987654',
      account_number: '54321098',
    },
  }];
  

  beforeEach(() => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    transactionService = jasmine.createSpyObj('TransactionService', ['getEnhancedTransactions']);

    TestBed.configureTestingModule({
      declarations: [TransactionsTableComponent],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: TransactionService, useValue: transactionService },
      ],
      imports: [HttpClientTestingModule],
    });

    fixture = TestBed.createComponent(TransactionsTableComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open create transaction modal', () => {
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpyObj.afterClosed.and.returnValue(of(null));
    dialog.open.and.returnValue(dialogRefSpyObj);
    component.openCreateTransactionModal();
    expect(dialog.open).toHaveBeenCalledWith(TransactionsCreateComponent, {
      width: '400px', 
    });
  });

});
