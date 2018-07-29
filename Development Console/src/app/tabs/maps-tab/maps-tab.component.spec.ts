import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsTabComponent } from './maps-tab.component';

describe('MapsTabComponent', () => {
  let component: MapsTabComponent;
  let fixture: ComponentFixture<MapsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
