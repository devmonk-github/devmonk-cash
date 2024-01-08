import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareStatisticsDateComponent } from './compare-statistics-date.component';

describe('CompareStatisticsDateComponent', () => {
  let component: CompareStatisticsDateComponent;
  let fixture: ComponentFixture<CompareStatisticsDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareStatisticsDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareStatisticsDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
