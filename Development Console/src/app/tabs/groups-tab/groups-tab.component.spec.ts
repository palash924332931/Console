import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsTabComponent } from './groups-tab.component';

describe('GroupsTabComponent', () => {
  let component: GroupsTabComponent;
  let fixture: ComponentFixture<GroupsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
