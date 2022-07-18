import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionAuditUiComponent } from './transaction-audit-ui.component';

describe('TransactionAuditUiComponent', () => {
  let component: TransactionAuditUiComponent;
  let fixture: ComponentFixture<TransactionAuditUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionAuditUiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionAuditUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
