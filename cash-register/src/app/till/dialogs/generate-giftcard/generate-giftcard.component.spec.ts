import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateGiftcardComponent } from './generate-giftcard.component';

describe('GenerateGiftcardComponent', () => {
  let component: GenerateGiftcardComponent;
  let fixture: ComponentFixture<GenerateGiftcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateGiftcardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateGiftcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
