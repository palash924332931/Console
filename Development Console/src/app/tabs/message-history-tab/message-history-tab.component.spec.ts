import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageHistoryTabComponent } from './message-history-tab.component';

describe('MessageHistoryTabComponent', () => {
  let component: MessageHistoryTabComponent;
  let fixture: ComponentFixture<MessageHistoryTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageHistoryTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageHistoryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
