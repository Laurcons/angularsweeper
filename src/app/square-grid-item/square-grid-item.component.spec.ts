import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareGridItemComponent } from './square-grid-item.component';

describe('SquareGridItemComponent', () => {
  let component: SquareGridItemComponent;
  let fixture: ComponentFixture<SquareGridItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquareGridItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SquareGridItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
