import { Component, OnInit, DoCheck } from '@angular/core';
import { UserList } from '../../shared/model/user-list'
import { MessageHistory } from '../../shared/model/message-history'
import { AuthService } from "../../providers/auth.service";
import { FirebaseDb } from "../../shared/model/constants"
import { Observable } from 'rxjs/Rx'
declare var jQuery: any;
@Component({
  selector: 'app-message-history-tab',
  templateUrl: './message-history-tab.component.html',
  styleUrls: ['./message-history-tab.component.css']
})

export class MessageHistoryTabComponent implements OnInit, DoCheck {
  messageHistoryNodes: any[];
  activeWeabols: UserList[] = [];
  messageHistory: MessageHistory[];
  messageHistoryAll: MessageHistory[];
  messageHistoryTemp: MessageHistory[];
  selectedUser: string = 'all user';
  sendByFilter: boolean = false;
  IsNewMessageDetected: boolean = false;
  messageHistoryPullTime: number;
  constructor(private authService: AuthService, private fBList: FirebaseDb) { }

  public messageHistoryTableBind = {
    tableID: "messtage-history-table",
    tableClass: "table table-border ",
    tableName: "Message history of " + this.selectedUser,
    tableRowIDInternalName: "key",
    columnNameSetAsClass: "Status",
    tableColDef: [
      { headerName: 'From ', width: '15%', internalName: 'SentByName', sort: true, type: "" },
      { headerName: 'Sent to', width: '15%', internalName: 'ReceivedByName', sort: true, type: "" },
      { headerName: 'Message', width: '35%', internalName: 'MsgText', sort: true, type: "" },
      { headerName: 'Sending Time', width: '13%', internalName: 'SentDate', sort: false, type: "" },
      { headerName: 'Status', width: '10%', internalName: 'Status', sort: true, type: "" }
    ],
    enabledSearch: true,
    enabledSerialNo: true,
    pageSize: 25,
    enabledColumnFilter: true,
    enabledPagination: false,
    enabledAutoScrolled: true,
    pTableStyle: {
      tableOverflowY: true,
      overflowContentHeight: '432px'
    }
  };

  ngOnInit() {
    this.fnTimerToRereshMessage();
    //to get data of user list
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable)).subscribe((rec: any) => {
      this.activeWeabols = [];
      this.wearbolUserWithGroup = [];
      rec.forEach(element => {
        element.key = element.$key
      });

      this.fnFormatOfWearbolUser(rec);
    });

    //to get data of message history
    this.authService.fnGetDataUsingCustomQuery(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable),
      {
        orderByChild: "SentDate",
        limitToFirst: 10000,
      }
    ).subscribe((rec: any) => {
      this.messageHistoryAll = [];
      this.messageHistory = [];
      this.messageHistoryTemp = [];
      rec.forEach((record: any) => {
        record.key = record.$key;
      });


      this.messageHistoryTemp = JSON.parse(JSON.stringify(rec));
      //for sorting
      this.messageHistoryTemp = this.messageHistoryTemp.sort((n1, n2) => {
        if (n1["SentDate"] < n2["SentDate"]) { return 1; }
        if (n1["SentDate"] > n2["SentDate"]) { return -1; }
        return 0;
      });

      this.messageHistoryPullTime = this.authService.fnGetUTCFormatDate();
      this.fnFormatMessageHistory();

    });

  }

  ngDoCheck() { }

  fnSelectUser(UserList: UserList, event: any) {
    if (event.target.checked) {
      jQuery(".history-filter").prop("checked", false);
      this.selectedUser = UserList.UserName;
      this.messageHistoryTableBind.tableName = "Message history of " + this.selectedUser;
      this.messageHistory = this.messageHistoryAll;
      this.messageHistory = this.messageHistoryAll.filter(rec => { if (rec.SentByName == this.selectedUser || rec.ReceivedByName == this.selectedUser) { return true } else { return false; } });
      //JQuery("radioMessageType").prop("checked",false);     
    } else {
      this.selectedUser = "all user";
      this.messageHistoryTableBind.tableName = "Message history of " + this.selectedUser;//to assign table header      
      this.messageHistory = this.messageHistoryAll;

    }
  }

  fnFilterApply(type: string, event: any) {
    if (type == 'sendByFilter') {
      this.messageHistory = this.messageHistoryAll.filter(rec => { if (rec.SentByName == this.selectedUser) { return true } else { return false; } });
    }
    else if (type == 'sendToFilter') {
      this.messageHistory = this.messageHistoryAll.filter(rec => { if (rec.ReceivedByName == this.selectedUser) { return true } else { return false; } });
    }
    else if (type == 'bothFilter') {
      this.messageHistory = this.messageHistoryAll.filter(rec => { if (rec.SentByName == this.selectedUser || rec.ReceivedByName == this.selectedUser) { return true } else { return false; } });
    }
  }

  fnTimerToRereshMessage() {
    Observable.interval(1000 * 60)
      .subscribe((x) => {
        if (this.authService.fnGetUTCFormatDate() - this.messageHistoryPullTime > 120000) {
          this.fnFormatMessageHistory();
        }
      });
  }

  wearbolUserWithGroup: any[] = [];
  fnFormatOfWearbolUser(rec: any) {
    this.wearbolUserWithGroup = [];
    this.activeWeabols = JSON.parse(JSON.stringify(rec));
    //to add consoole user to the user list
    let consoleUser = JSON.parse(localStorage.getItem('wearbolsConsoleUser')) || [];
    if (consoleUser.length > 0) {
      this.activeWeabols.push({ $key: consoleUser[0].key, Userkey: consoleUser[0].key, UserName: consoleUser[0].UserName, UserEmail: consoleUser[0].UserEmail, UserFullName: consoleUser[0].UserFullName, CompanyKey: "", RoleKey: "", GroupKey: "", GroupName: "Console Admin", Comments: "", CreatedBy: "", CreatedDate: "", OnlineStatus: "online", LastSeen: "-1" });
    }

    //to update status
    this.activeWeabols.forEach((record: any) => {
      record.OnlineStatus = record.OnlineStatus == 'offline' ? 'offline' : (Math.floor((this.authService.fnGetUTCFormatDate()) - (record.LastSeen == "-1" ? this.authService.fnGetUTCFormatDate() : +record.LastSeen)) < 600000 ? 'online' : 'offline');
    });

    //to find unique Group
    let uniqueGroup = this.authService.fnFindUniqueColumnWithCheckedFlag(this.activeWeabols, 'GroupName') || [];

    uniqueGroup.forEach((record: any) => {
      if (record.data != null && record.data != "") {//check for group is empty 
        let userUnderGroup = this.activeWeabols.filter((rec: any) => { if (rec.GroupName == record.data && rec.GroupName != "" && rec.UserName!=null && rec.UserName!=" ") { return true } else { return false } }) || [];
        if (userUnderGroup.length > 0) {
          this.wearbolUserWithGroup.push({ GroupName: record.data, UserList: userUnderGroup })
        }
      }

    });
  }

  selectedGroupName: string;
  fnAccordionActivity(groupName: any) {
    if (this.selectedGroupName == groupName) {
      this.selectedGroupName = "";
    } else {
      this.selectedGroupName = groupName;
    }
  }

  fnFormatMessageHistory() {
    this.messageHistoryAll = JSON.parse(JSON.stringify(this.messageHistoryTemp));
    this.messageHistoryAll.forEach((record) => {
      record.SentDate = this.authService.fnDateTimeDifference(record.SentDate);
    });

    this.messageHistory = this.messageHistoryAll.filter((rec) => {
      if (this.selectedUser == "all user") {
        return true
      } else {
        if (this.selectedUser == rec.ReceivedByName || this.selectedUser == rec.SentByName) {
          return true;
        } else {
          return false;
        }
      }
    });
  }

}
