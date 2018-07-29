import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../providers/auth.service";
import { FirebaseDb } from "../../shared/model/constants"
import { setting, wifiAccess } from "../../shared/model/settings"
import { AlertService } from "../../shared/components/alert/alert.service";
declare var jQuery;
@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.css', '../../shared/css/common.css']
})

export class SettingsTabComponent implements OnInit {
  public IsConsoleUserExists: boolean = true;
  public settings: any = { IdleTime: 10, GroupEnabled: false, VibrateTime: 0, PersistentNotifications: false, EscalatingNotifications: false, CustomMessageEnable: false, MapsEnabled: false, }
  public defaultSetting: any = { IdleTime: 10, GroupEnabled: false, VibrateTime: 0, PersistentNotifications: false, EscalatingNotifications: false, CustomMessageEnable: false, MapsEnabled: false, }
  public wifiAccessPointDetails: wifiAccess[] = [];
  public wifiName: string;
  public wifiPassword: string;
  public IsEditWifi: boolean = false;
  public globalKey: string;
  constructor(private authService: AuthService, private fBList: FirebaseDb, private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable)).subscribe((rec: any) => {
      debugger
      this.settings = rec[0]||this.defaultSetting;
    });

    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable) + "/WifiAccessPoints").subscribe((record: any) => {
      record.forEach(element => {
        element.key = element.$key
      });
      this.wifiAccessPointDetails = record;
    });
  }

  fnSaveSettingInfo() {
    this.authService.db.database.ref(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable) + "/" +
      this.authService.afAuth.auth.currentUser.uid).set(
      this.settings
      );
  }

  fnCreateConsoleUser() {
    this.authService.fnSaveData(FirebaseDb.firebaseConsoleUserListTable, {
      UserName: 'ConsoleAdmin',
      UserEmail: 'test@test.com',
      UserFullName: "Console Admin",
      LastSeen: ""
    });
  }
  
  fnAddNewWifi() {
    this.IsEditWifi = false;
    jQuery("#wifiModalDialog").modal('show');
  }
  fnAddWifiDetails() {
    if (this.wifiName == "" || this.wifiPassword == "") {

    }
    jQuery("#wifiModalDialog").modal('hide');
    if (this.IsEditWifi) {
      this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable) + '/WifiAccessPoints',this.globalKey, { wifiName: this.wifiName, wifiPassword: this.wifiPassword });
    } else {
      this.authService.fnSaveData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable) + '/WifiAccessPoints', { wifiName: this.wifiName, wifiPassword: this.wifiPassword });
    }

  }
  fnActivityOnRecord(event: any) {
    var record = event.record;
    if (event.action == "edit-item") {
      this.IsEditWifi = true;
      this.globalKey=record.key;
      this.wifiName = record.wifiName;
      this.wifiPassword = record.wifiPassword;
      jQuery("#wifiModalDialog").modal('show');
    }
    else if (event.action == "delete-item") {
      this.alertService.confirm("Do you want to delete?", () => {
        this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable) + '/WifiAccessPoints', record.key);
      }, () => { });
    }
  }

  public wifiAccessPointTableBind = {
    tableID: "messtage-history-table",
    tableClass: "table table-border ",
    tableName: "WiFi Access Point Details ",
    tableRowIDInternalName: "key",
    tableColDef: [
      { headerName: 'WiFi Name ', width: '40%', internalName: 'wifiName', sort: true, type: "" },
      { headerName: 'WiFi Password', width: '35%', internalName: 'wifiPassword', sort: true, type: "" },
    ],
    enabledSearch: true,
    enabledSerialNo: true,
    enabledPagination: false,
    enabledAutoScrolled: true,
    enabledEditBtn: true,
    pTableStyle: {
      tableOverflowY: true,
      overflowContentHeight: '432px'
    }
  };
}