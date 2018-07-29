import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTemplateTabComponent } from './message-template-tab.component';

describe('MessageTemplateTabComponent', () => {
  let component: MessageTemplateTabComponent;
  let fixture: ComponentFixture<MessageTemplateTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageTemplateTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageTemplateTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
