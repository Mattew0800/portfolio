import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogScreen } from './log-screen';

describe('LogScreen', () => {
  let component: LogScreen;
  let fixture: ComponentFixture<LogScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
