import { Component, OnInit } from '@angular/core';
import { UserList } from '../../shared/model/user-list'
import { AuthService } from "../../providers/auth.service";
import { FirebaseDb } from "../../shared/model/constants"
import { AlertService } from "../../shared/components/alert/alert.service";
declare var jQuery: any;
@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
  styleUrls: ['./home-tab.component.css']
})
export class HomeTabComponent implements OnInit {
  public templateMessage: any[] = [];
  public customMessageEnabled: boolean = true;
  public templateMessageEnabled: boolean = false;
  public activeWeabols: UserList[] = [];
  public activeWeabolsTemp: any[] = [];
  public activeWeabolsUser: any[] = [];
  public templateMessageArray = [];
  public userDetails: any;



  constructor(private authService: AuthService, private fBList: FirebaseDb, private alertService: AlertService) { }

  ngOnInit() {
    this.userDetails = JSON.parse(localStorage.getItem('wearbolsConsoleLogin')); //this.authService.fnGetUserDetails();
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable)).subscribe((rec: any) => {
      this.activeWeabols = [];
      rec.forEach((record: any) => {
        record.key = record.$key;
      });
      this.activeWeabols = JSON.parse(JSON.stringify(rec));
      this.activeWeabolsTemp = JSON.parse(JSON.stringify(this.activeWeabolsUser));
      this.activeWeabolsUser = [];


      this.activeWeabols.forEach((record: any) => {
        if (record.UserName != null && record.UserName != "" && record.UserName != " " && record.key != null) {
          let checkedUser = this.activeWeabolsTemp.filter((row: any) => row.Userkey == record.key);
          this.activeWeabolsUser.push({ UserName: record.UserName, Userkey: record.key, GroupKey: record.GroupKey, Selected: checkedUser.length > 0 ? checkedUser[0].Selected : false, OnlineStatus: record.OnlineStatus == 'offline' ? 'offline' : (Math.floor((this.authService.fnGetUTCFormatDate()) - (record.LastSeen == "-1" ? this.authService.fnGetUTCFormatDate() : +record.LastSeen)) < 600000 ? 'online' : 'offline') })
          //this.activeWeabolsUser.push({ UserName: record.UserName, Userkey: record.key, GroupKey: record.GroupKey, Selected: false, OnlineStatus: record.OnlineStatus == 'offline' ? 'offline' : (Math.floor((this.authService.fnGetUTCFormatDate()) - (record.LastSeen == "-1" ?this.authService.fnGetUTCFormatDate(): +record.LastSeen )) < 600000 ? 'online' : 'offline') })
        }
      });
      this.activeWeabols = this.activeWeabols.sort((n1, n2) => {
        if (n1["OnlineStatus"] === "online" && n2["OnlineStatus"] !== "online") { return -1; }
        if (n1["OnlineStatus"] !== "online" && n2["OnlineStatus"] === "online") { return 1; }
        return 0;
      });



    });

    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable)).subscribe(rec => {
      this.templateMessage = rec;
      this.templateMessage.forEach(record => this.templateMessageArray.push(record));
    });
  }

  fnSelectMessageType(messagetype: string, event: any) {
    if (messagetype == 'custom-message') {
      if (event.target.checked) {
        this.customMessageEnabled = true;
        this.templateMessageEnabled = false;
      }

    } else {
      this.customMessageEnabled = false;
      this.templateMessageEnabled = true;
    }
  }

  fnSelectUser(type: string, user: any, event) {
    if (type == 'all-user') {
      if (event.target.checked) {
        this.activeWeabolsUser.forEach(rec => { rec.Selected = true });
      } else {
        this.activeWeabolsUser.forEach(rec => { rec.Selected = false });
      }
    }

  }

  fnSendMessage() {
    let selectedUserCount = this.activeWeabolsUser.filter(rec => rec.Selected == true);
    let txtMessage = "";
    if (selectedUserCount.length > 0) {
      if (this.templateMessageEnabled) {
        txtMessage = jQuery("#templateMessageSelect").val();
      } else {
        txtMessage = jQuery("#messageContent").val();
      }

      if (txtMessage == "") {
        this.alertService.alert("Please write custom message or select template message");
        return false;
      }

      selectedUserCount.forEach(rec => {
        let message = {
          SentByKey: this.userDetails.key,
          SentByName: this.userDetails.UserName,
          SentDate: this.authService.fnGetUTCFormatDate(),
          SentByGroupKey: "",
          ReceivedByKey: rec.Userkey,
          ReceivedByName: rec.UserName,
          ReceivedDate: this.authService.fnGetUTCFormatDate(),
          ReceivedByGroupKey: rec.GroupKey,
          AckNackStatus: "Na",
          AckNackDate: "",
          MsgText: txtMessage,
          Status: "Unread",
          ModifiedBy: "",
          ModifiedDate: this.authService.fnGetUTCFormatDate()
        }

        this.authService.fnSaveData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), message);
        this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), rec.Userkey, { HasUnreadMessage: true })
      }
      );

      this.alertService.alert("Your message sent successfully.");
      jQuery("#messageContent").val("");
      this.activeWeabolsUser.forEach(rec => rec.Selected = false);
      this.customMessageEnabled = true;
      this.templateMessageEnabled = false;
      jQuery(".message-sending-table input:radio").prop("checked", false);
      return false;
    } else {
      this.alertService.alert("Please select any user before sending message.");
    }
  }
}
