import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TransactionService } from '../transaction.service';
import { TransactionCreate, TransactionType } from '../transaction.interface';
import { BankAccount } from '../../bank-account/bank-account.interface';
import { BankAccountService } from '../../bank-account/bank-account.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-transactions-create',
  templateUrl: './transaction-create.component.html',
  styleUrls: ['./transaction-create.component.scss'],
})
export class TransactionsCreateComponent implements OnInit {
  transactionForm: FormGroup;
  isFullWithdrawal = true;
  showFullAmountCheckbox = false;
  bankAccounts: BankAccount[] = [];
  sourceBankVisible = true;
  targetBankVisible = true;
  fullAmountControl: FormControl;

  constructor(
    private fb: FormBuilder,
    private bankAccountService: BankAccountService,
    private transactionService: TransactionService,
    private dialogRef: MatDialogRef<TransactionsCreateComponent>,
  ) {
    this.transactionForm = this.fb.group({
      transaction_type: ['', Validators.required],
      amount: [0, [Validators.min(0)]],
      source_bank_account_id: [''],
      target_bank_account_id: [''],
      description: [''],
    });
    this.fullAmountControl = new FormControl(false);
    this.fullAmountControl.valueChanges.subscribe((value) => {
      this.handleFullAmountChange(value);
    });
  }

  ngOnInit(): void {
    this.bankAccountService.getBankAccounts().subscribe((bankAccounts) => {
      this.bankAccounts = bankAccounts;
    });

    const transactionTypeControl = this.transactionForm.get('transaction_type');
    if (transactionTypeControl) {
      transactionTypeControl.valueChanges.subscribe((value) => {
        this.updateFormControls(value);
      });
    }
  }

  private handleFullAmountChange(isFullAmount: boolean): void {
    const amountControl = this.transactionForm.get('amount');

    if (isFullAmount && amountControl) {
      // When full_amount is selected, disable amount and set its value to current_value
      amountControl.disable();
      const sourceAccountId = this.transactionForm.get(
        'source_bank_account_id'
      )?.value;
      const sourceAccount = this.bankAccounts.find(
        (account) => account.id === +sourceAccountId
      );
      if (sourceAccount) {
        amountControl.setValue(sourceAccount.current_value);
      }
    } else {
        if (amountControl) {
          amountControl.enable();
          amountControl.setValue(null); // Reset the amount value
        }
      
    }
  }

  updateFormControls(transactionType: string): void {
    const sourceBankControl = this.transactionForm.get('source_bank_account_id');
    const targetBankControl = this.transactionForm.get('target_bank_account_id');
    const amountControl = this.transactionForm.get('amount');
  
    // Reset form controls and validation
    sourceBankControl?.setValidators(null);
    targetBankControl?.setValidators(null);
    amountControl?.setValidators(null);
  
    switch (transactionType) {
      case TransactionType.DEPOSIT:
        this.sourceBankVisible = false;
        this.targetBankVisible = true;
        this.showFullAmountCheckbox = false;
        targetBankControl?.setValidators(Validators.required);
        break;
      case TransactionType.WITHDRAW:
        this.sourceBankVisible = true;
        this.targetBankVisible = false;
        this.showFullAmountCheckbox = true;
        sourceBankControl?.setValidators(Validators.required);
        amountControl?.setValidators([
          Validators.min(0),
          this.validateWithdrawalAmount(),
        ]);
        break;
      case TransactionType.TRANSFER:
        this.sourceBankVisible = true;
        this.targetBankVisible = true;
        this.showFullAmountCheckbox = true;
        sourceBankControl?.setValidators(Validators.required);
        targetBankControl?.setValidators([
          Validators.required,
          this.validateSameClient(),
        ]);
        amountControl?.setValidators([
          Validators.min(0),
          this.validateTransferAmount(),
        ]);
        break;
      default:
        break;
    }
  
    sourceBankControl?.updateValueAndValidity();
    targetBankControl?.updateValueAndValidity();
    amountControl?.updateValueAndValidity();
  }

  validateWithdrawalAmount(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const enteredAmount: number = control.value;
      const sourceAccountId: number | string = this.transactionForm.get(
        'source_bank_account_id'
      )?.value;
      const sourceAccount = this.bankAccounts.find(
        (account) => account.id === +sourceAccountId
      );
      if (!sourceAccount) {
        // Source account not found
        return { sourceAccountNotFound: true };
      } 
      if (
        enteredAmount === null ||
        enteredAmount === undefined ||
        enteredAmount <= 0
      ) {
        // Amount is invalid
        return { invalidAmount: true };
      } else if (enteredAmount > sourceAccount.current_value) {
        // Amount exceeds the current value of the source bank account
        return { amountExceedsBalance: true };
      }
      
      return null; // Amount is valid
    };
  }
  
  validateSameClient(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const sourceAccountId = control.parent?.get('source_bank_account_id')?.value;
      const targetAccountId = control.parent?.get('target_bank_account_id')?.value;

      if (!sourceAccountId || !targetAccountId) {
        // Source and target accounts are required
        return { accountsRequired: true };
      }

      if (sourceAccountId === targetAccountId) {
        // Source and target accounts cannot be the same
        return { sameAccount: true };
      }

      // Fetch the source and target accounts to check if they have the same client_id
      const sourceAccount = this.bankAccounts.find((account) => account.id === sourceAccountId);
      const targetAccount = this.bankAccounts.find((account) => account.id === targetAccountId);

      if (sourceAccount?.client_id !== targetAccount?.client_id) {
        // Source and target accounts have different client_id values
        return { differentClient: true };
      }

      return null; // Validation passed
    };
  }

  validateTransferAmount(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const enteredAmount: number = control.value;
      const sourceAccountId: number | string = this.transactionForm.get('source_bank_account_id')?.value;
      const sourceAccount = this.bankAccounts.find((account) => account.id === sourceAccountId);
      if (!sourceAccount) {
        // Source account not found
        return { sourceAccountNotFound: true };
      }
      if (enteredAmount === null || enteredAmount === undefined || enteredAmount <= 0) {
        // Amount is invalid
        return { invalidAmount: true };
      } else if (enteredAmount > sourceAccount.current_value) {
        // Amount exceeds the current value of the source bank account
        return { amountExceedsBalance: true };
      }
      return null; // Validation passed
    }
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formData = this.transactionForm.value as TransactionCreate;
      console.log(formData);
      this.transactionService.createTransaction(formData);
      // Clear the form or initialize with default values
      this.transactionForm.reset({
        transaction_type: '',
        amount: 0,
        source_bank_account_id: '',
        target_bank_account_id: '',
        description: '',
      });
      this.dialogRef.close();
    }
  }
}
