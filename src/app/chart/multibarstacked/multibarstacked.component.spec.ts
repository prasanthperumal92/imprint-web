import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultibarstackedComponent } from './multibarstacked.component';

describe('MultibarstackedComponent', () => {
  let component: MultibarstackedComponent;
  let fixture: ComponentFixture<MultibarstackedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultibarstackedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultibarstackedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
