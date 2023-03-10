import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDialogMergeComponent } from './customer-dialog-merge.component';

describe('CustomerDialogMergeComponent', () => {
  let component: CustomerDialogMergeComponent;
  let fixture: ComponentFixture<CustomerDialogMergeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerDialogMergeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerDialogMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
