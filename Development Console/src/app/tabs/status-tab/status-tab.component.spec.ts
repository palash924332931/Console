import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTabComponent } from './status-tab.component';

describe('StatusTabComponent', () => {
  let component: StatusTabComponent;
  let fixture: ComponentFixture<StatusTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
