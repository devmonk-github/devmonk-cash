import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltiPointsDiscountComponent } from './loyalti-points-discount.component';

describe('LoyaltiPointsDiscountComponent', () => {
  let component: LoyaltiPointsDiscountComponent;
  let fixture: ComponentFixture<LoyaltiPointsDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoyaltiPointsDiscountComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoyaltiPointsDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
