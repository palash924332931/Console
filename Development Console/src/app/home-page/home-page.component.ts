import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService } from '../providers/auth.service'
import { AngularFireDatabase, AngularFireDatabaseModule, FirebaseListObservable } from 'angularfire2/database';
import { TabEnum, FirebaseDb } from "../shared/model/constants"
import { Tab } from "../shared/model/tab"
import { Observable } from 'rxjs/Rx'
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})


export class HomePageComponent implements OnInit, DoCheck {
  items: FirebaseListObservable<any[]>;
  public user$ = this.authService.user$;
  public IsFirstLoaded: boolean = false;
  public IsDataAvailable: boolean = false;
  public IsMessageFirstLoaded: boolean = false;
  public mapDisabled: boolean;

  showUserDetails: boolean = false;
  consoleUser: any = JSON.parse(localStorage.getItem('wearbolsConsoleLogin'));
  consoleUserNewMessage: any[] = [];
  consoleUserRejectedMessage: any[] = [];
  settingsDetails: any;

  public selectedTab: Tab =
    { tabId: TabEnum.Home, tabName: 'Console Messages', disabled: false };

  public tabs: Tab[] = [
    { tabId: TabEnum.Home, tabName: 'Console Messages', disabled: false },
    { tabId: TabEnum.MessageHistory, tabName: 'Message History', disabled: false },
    { tabId: TabEnum.Status, tabName: 'Status', disabled: false },
    { tabId: TabEnum.StickyMessage, tabName: 'Sticky Notes', disabled: false },
    { tabId: TabEnum.Groups, tabName: 'Groups & Users', disabled: false },
    { tabId: TabEnum.MessageTemplates, tabName: 'Message Templates', disabled: false },
    { tabId: TabEnum.Maps, tabName: 'Maps', disabled: true },
    { tabId: TabEnum.Settings, tabName: 'Settings', disabled: false }
  ];

  // bit of a hack to access enum from html
  public TabEnum = TabEnum;

  constructor(public authService: AuthService, private router: Router, private fBList: FirebaseDb) { }


  ngOnInit() {
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable)).subscribe((rec: any) => {
      this.settingsDetails = rec[0];
      this.mapDisabled = this.settingsDetails.MapsEnabled != undefined ? !this.settingsDetails.MapsEnabled : true;
      this.tabs.forEach((record: Tab) => {
        if (record.tabName == "Maps") {
          record.disabled = this.mapDisabled;
        }
      });
      //console.log(this.mapDisabled);
    });
    //to check the user already login
    if (localStorage.getItem("wearbolsConsoleLogin") === null) {
      this.router.navigate(['login'])
    }
    this.IsFirstLoaded = true;
    this.IsMessageFirstLoaded = true;

    //send online status every four min
    this.fnUpdateOnlineStatus();


    //to check new message for console admin
    let customQueryConsoleMessage = {
      orderByKey: true,
      limitToLast: 1,
    }
    this.authService.fnGetDataUsingCustomQuery(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), customQueryConsoleMessage).subscribe(
      (rec: any) => {
        rec.forEach((reccord: any) => {
          reccord.key = reccord.$key;
        });

        if (rec.length > 0) {
          //if (rec[0].ReceivedByName == this.consoleUser.UserName && rec[0].Status == 'Unread' && this.IsMessageFirstLoaded != true) {
          if (rec[0].ReceivedByKey == this.consoleUser.key && rec[0].Status == 'Unread' && this.IsMessageFirstLoaded != true) {
            this.IsNewMessage = true;
            this.fnShowNewMessage("NewMessage");
            this.consoleUserNewMessage = JSON.parse(JSON.stringify(rec));
          } else {
            this.IsMessageFirstLoaded = false;
          }
        }
      });

    //to trigger for rejected message
    this.fnTriggerOnUpdate(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable));

  }

  ngDoCheck() {
    if (this.IsFirstLoaded) {//to send last seen value after first login
      this.authService.fnUpdateData(FirebaseDb.firebaseConsoleUserListTable, this.consoleUser.key, { LastSeen: this.authService.fnGetUTCFormatDate() });
      this.IsFirstLoaded = false;
    }
  }

  logout() {
    this.showUserDetails = false;

    this.authService.fnLogout();
    this.router.navigate(['login']);
  }

  fnSelectTab(selectedTab: Tab) {
    this.selectedTab = selectedTab;
  }


  fnShowAccountDetails() {
    if (this.showUserDetails) {
      this.showUserDetails = false;
    } else {
      this.showUserDetails = true;
    }
  }

  fnUpdateOnlineStatus() {
    Observable.interval(3000 * 60)
      .subscribe((x) => {
        this.authService.fnUpdateData(FirebaseDb.firebaseConsoleUserListTable, this.consoleUser.key, { LastSeen: this.authService.fnGetUTCFormatDate() });
      });
  }

  IsNewMessage: boolean = false;
  IsRejectedMessage: boolean = false;
  fnShowNewMessage(messageType: string) {
    Observable.timer(18000).subscribe((x: any) => {
      if (messageType == "NewMessage") {
        this.IsNewMessage = false;
        this.consoleUserNewMessage = [];
      } else if (messageType == "RejectedMessage") {
        this.IsRejectedMessage = false;
        this.consoleUserRejectedMessage = [];
      }

    });
  }

  fnHideNewMessageModal(message: any, messageType: string) {
    if (messageType == "NewMessage") {
      this.IsNewMessage = false;
      this.consoleUserNewMessage = [];
      message.forEach(element => {
        this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), element.key, { Status: 'Read' });
      });
    } else if (messageType == "RejectedMessage") {
      this.IsRejectedMessage = false;
      this.consoleUserRejectedMessage = [];
    }

  }

  fnTriggerOnUpdate(tableName: string, triggerType: string = "child_changed") {
    firebase.database().ref('/' + tableName).on(triggerType, c => {
      //console.log("child_changed ", c.val());
      let changedRecord = c.val();
      if (changedRecord.Status == "Rejected" && changedRecord.SentByName == this.consoleUser.UserName) {
        this.IsRejectedMessage = true;
        this.consoleUserRejectedMessage.push(changedRecord);
        this.fnShowNewMessage("RejectedMessage");
      }
    });
  }

}


