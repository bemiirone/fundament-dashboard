import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormControl,
  FormBuilder,
} from '@angular/forms';
import { TransactionsCreateComponent } from './transaction-create.component';
import { BankAccountService } from '../../bank-account/bank-account.service';
import { TransactionService } from '../transaction.service';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Validators } from '@angular/forms';

class MockBankAccountService {
  getBankAccounts() {
    return of([
      {
        id: 1,
        bank_name: 'Bank A',
        account_holder_name: 'Miss Jane A Smith',
        sort_code: '111111',
        account_number: '11111111',
        client_id: 1,
        current_value: 128746.281,
      },
      {
        id: 2,
        bank_name: 'Bank B',
        account_holder_name: 'Thomas Christopher Wright',
        sort_code: '222222',
        account_number: '22222222',
        client_id: 2,
        current_value: 46.2,
      },
    ]);
  }
}

class MockTransactionService {
  createTransaction(formData: any) {
    return of({ success: true }); 
  }
}

describe('TransactionsCreateComponent', () => {
  let component: TransactionsCreateComponent;
  let fixture: ComponentFixture<TransactionsCreateComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TransactionsCreateComponent>>;
  let bankAccountService: jasmine.SpyObj<BankAccountService>;
  let fb: FormBuilder;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      declarations: [TransactionsCreateComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BankAccountService, useClass: MockBankAccountService },
        { provide: TransactionService, useClass: MockTransactionService },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    fixture = TestBed.createComponent(TransactionsCreateComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder); //
    component.transactionForm = fb.group({
      transaction_type: [''],
      source_bank_account_id: [''],
      target_bank_account_id: [''],
      amount: [0],
      description: [''],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update form controls for DEPOSIT', () => {
    component.updateFormControls('DEPOSIT');

    expect(component.sourceBankVisible).toBe(false);
    expect(component.targetBankVisible).toBe(true);
    expect(component.showFullAmountCheckbox).toBe(false);

    const sourceBankControl = component.transactionForm.get(
      'source_bank_account_id'
    );
    const targetBankControl = component.transactionForm.get(
      'target_bank_account_id'
    );
    const amountControl = component.transactionForm.get('amount');

    expect(sourceBankControl?.validator).toBeNull();
    expect(targetBankControl?.validator).toEqual(Validators.required);
    expect(amountControl?.validator).toBeNull();
  });

  it('should update form controls for DEPOSIT', () => {
    component.updateFormControls('DEPOSIT');

    expect(component.sourceBankVisible).toBe(false);
    expect(component.targetBankVisible).toBe(true);
    expect(component.showFullAmountCheckbox).toBe(false);

    const sourceBankControl = component.transactionForm.get(
      'source_bank_account_id'
    );
    const targetBankControl = component.transactionForm.get(
      'target_bank_account_id'
    );
    const amountControl = component.transactionForm.get('amount');

    expect(sourceBankControl?.validator).toBeNull();
    expect(targetBankControl?.validator).toEqual(Validators.required);
    expect(amountControl?.validator).toBeNull();
  });

  it('should update form controls for WITHDRAW', () => {
    component.updateFormControls('WITHDRAW');

    expect(component.sourceBankVisible).toBe(true);
    expect(component.targetBankVisible).toBe(false);
    expect(component.showFullAmountCheckbox).toBe(true);

    const sourceBankControl = component.transactionForm.get(
      'source_bank_account_id'
    );
    const targetBankControl = component.transactionForm.get(
      'target_bank_account_id'
    );
    const amountControl = component.transactionForm.get('amount');

    expect(sourceBankControl?.validator).toEqual(Validators.required);
    expect(targetBankControl?.validator).toBeNull();
  });

  it('should call getBankAccounts and set bankAccounts on ngOnInit', () => {
    component.ngOnInit();
    expect(component.bankAccounts.length).toBe(2);
  });

  it('should close the dialog on form submission', () => {
    component.transactionForm.setValue({
      transaction_type: 'some_value', // Provide valid data
      amount: 100, // Provide a positive amount
      source_bank_account_id: '1',
      target_bank_account_id: '2',
      description: 'Transaction description',
    });
    component.onSubmit();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  
  it('should validate transfer amount when source account is not found', () => {
    const control = fb.control(100); 
    spyOn(component.transactionForm, 'get').and.returnValue(new FormControl('source_account_id'));
  
    component.bankAccounts = []; 
  
    const result = component.validateTransferAmount()(control);
  
    expect(result).toEqual({ sourceAccountNotFound: true });
  });
});
