import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipModalComponent } from './ship-modal-component';

describe('ShipModalComponent', () => {
  let component: ShipModalComponent;
  let fixture: ComponentFixture<ShipModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
