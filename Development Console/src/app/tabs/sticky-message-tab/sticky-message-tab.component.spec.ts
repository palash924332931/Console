import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyMessageTabComponent } from './sticky-message-tab.component';

describe('StickyMessageTabComponent', () => {
  let component: StickyMessageTabComponent;
  let fixture: ComponentFixture<StickyMessageTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StickyMessageTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StickyMessageTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
