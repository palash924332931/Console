import { Component, OnInit, DoCheck } from '@angular/core';
import { AuthService } from "../../providers/auth.service";
import { FirebaseDb } from "../../shared/model/constants"
import { WatchList } from '../../shared/model/watch-info'
import { AlertService } from "../../shared/components/alert/alert.service";
import { promise } from 'selenium-webdriver';
import { debuglog } from 'util';
declare var jQuery: any;
@Component({
  selector: 'app-status-tab',
  templateUrl: './status-tab.component.html',
  styleUrls: ['./status-tab.component.css']
})
export class StatusTabComponent implements OnInit, DoCheck {
  public userListForStatus: WatchList[];
  public userListForAllStatus: WatchList[];
  public userListForStatusTemp: WatchList[];
  public changeDetectionFlag: boolean = false;
  public IsSelectOnline: boolean = true;
  public IsSelectOffline: boolean = false;
  public IsSelectAll: boolean = false;
  public activeWeabolsUserList: any[] = [];
  public weabolsUserList: any[] = [];
  consoleUser: any = JSON.parse(localStorage.getItem('wearbolsConsoleLogin'));
  constructor(private authService: AuthService, private fBList: FirebaseDb, private alertService: AlertService) { }
  ngOnInit() {
    //pull user information from user list
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable)).subscribe((rec: any) => {
      // this.activeWeabolsUserList = [];
      rec.forEach(element => {
        element.key = element.$key
      });

      this.weabolsUserList = JSON.parse(JSON.stringify(rec || [])) || [];
      this.fnLoadWatchesList();
    });


    //pull watch list
    let customQuery = {
      orderByChild: "DeploymentKey",
      equalTo: this.consoleUser.deploymentKey
    }

    this.authService.fnGetDataUsingCustomQuery(FirebaseDb.firebaseWatchInformationTable, customQuery).subscribe((rec: any) => {
      this.userListForStatus = [];
      this.userListForStatusTemp = [];
      this.userListForStatusTemp = rec;
      this.userListForStatusTemp.forEach((rec: any) => {
        // let key = rec.$key;
        rec.watchKey = rec.$key;
      });

      this.userListForAllStatus = JSON.parse(JSON.stringify(this.userListForStatusTemp));
      this.fnLoadWatchesList();
    });
  }

  ngDoCheck() {

  }



  fnTableCallback(event: any) {
    debugger;
    if (event.cellName == 'Enabled') {
      if (event.event.target.checked) {
        this.alertService.confirm("Do you want to enable user <b>" + event.record.UserName + "</b>?",
          () => {
            if (this.IsSelectOffline) {
              if (event.record.key != "" && event.record.key != null) {
                this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), event.record.key, { Enabled: true });
              }
            } else {
              if (event.record.UserKey != "" && event.record.UserKey != null) {
                this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), event.record.UserKey, { Enabled: true });
              }
            }
          },
          () => { }
        );

      } else {
        this.alertService.confirm("Do you want to disable user <b>" + event.record.UserName + "</b>?",
          () => {
            //to update watch table
            if (this.IsSelectOffline) {
              if (event.record.key != "" && event.record.key != null) {
                this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), event.record.key, { Enabled: false, OnlineStatus: 'offline',CurrentWatch:null });
              }
            } else {
              debugger
              if (event.record.watchKey != "") {
                this.authService.fnUpdateData(FirebaseDb.firebaseWatchInformationTable, event.record.watchKey, { OnlineStatus: 'offline' });
              }

              if (event.record.UserKey != "" && event.record.UserKey != null) {
                this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), event.record.UserKey, { Enabled: false, OnlineStatus: 'offline',CurrentWatch:null  });
              }
            }


          },
          () => { }
        );
      }
    } else if (event.cellName == 'Details') {
      this.fnShowDetailsInformation(event.record);
    }
  }

  public selectedWatchInfor: any = null;
  fnShowDetailsInformation(record: any) {
    this.selectedWatchInfor = record;
    jQuery("#watchDetailsModal").modal("show");
  }

  fnCheckRadio(event: any, type: string) {
    if (type == "OnlineOnly" && event == true) {
      this.IsSelectOnline = true;
      this.IsSelectOffline = false;
      this.IsSelectAll = false;
      this.fnLoadWatchesList();
    } else if (type == "OfflineOnly" && event == true) {
      this.IsSelectOnline = false;
      this.IsSelectOffline = true;
      this.IsSelectAll = false;
      this.fnLoadOfflineUserList();
    }
    else if (type == "Either" && event == true) {
      this.IsSelectOnline = false;
      this.IsSelectOffline = false;
      this.IsSelectAll = true;
      this.fnLoadWatchesList();
    }
  }


  fnLoadOfflineUserList() {
    this.activeWeabolsUserList = JSON.parse(JSON.stringify(this.weabolsUserList || [])) || [];
    this.activeWeabolsUserList = this.activeWeabolsUserList.filter((ele: any) => {
      if (ele.UserName != null && ele.UserName != "" && (ele.OnlineStatus == "offline" || Math.floor((this.authService.fnGetUTCFormatDate()) - (+ele.LastSeen)) > 600000)) {
        return true;
      } else {
        return false;
      }
    });


    //set logic for display
    this.activeWeabolsUserList.forEach((record: any) => {
      record.IsActive = record.LastSeen == "" || record.OnlineStatus == "offline" ? false : (Math.floor((this.authService.fnGetUTCFormatDate()) - (+record.LastSeen)) < 480000 ? true : false);
      record.LastSeen = record.LastSeen == "" ? "" : this.authService.fnDateTimeDifference(record.LastSeen);
    });

    this.watchListTableBind.tableColDef = [
      { headerName: 'Online/Offline', width: '8%', internalName: 'IsActive', type: "online-offline", onClick: "No", applyColFilter: 'No' },
      { headerName: 'Name', width: '10%', internalName: 'UserName', sort: true, type: "", onClick: "" },
      { headerName: 'Group', width: '10%', internalName: 'GroupName', type: "", onClick: "" },
      { headerName: 'Comments', width: '15%', internalName: 'Comments', type: "", onClick: "" },
      { headerName: 'Last Seen', width: '10%', internalName: 'LastSeen', type: "", onClick: "" },
      { headerName: 'Enable/Disable', width: '10%', internalName: 'Enabled', type: "checkbox-switch", onClick: "Yes", applyColFilter: 'No' },
    ]

  }

  fnLoadWatchesList() {
    debugger;
    this.userListForStatus = [];
    this.activeWeabolsUserList = [];
    if (this.IsSelectOffline) {
      this.fnLoadOfflineUserList();
      return false;
    }

    this.userListForStatus = JSON.parse(JSON.stringify(this.userListForAllStatus || [])) || [];
    //to find online watch
    this.userListForStatus=this.userListForStatus.filter((reco:any)=>{
      if (reco.UserName != null && reco.UserName != "" && reco.OnlineStatus != "offline" && Math.floor((this.authService.fnGetUTCFormatDate()) - (+reco.LastSeen)) < 600000) {
        return true;
      } else {
        return false;
      }
    });

    this.activeWeabolsUserList = JSON.parse(JSON.stringify(this.weabolsUserList || [])) || [];
    //to filter null user and which are active 
    this.activeWeabolsUserList = this.activeWeabolsUserList.filter((ele: any) => {
      if (ele.UserName != null && ele.UserName != "" && ele.OnlineStatus != "offline" && Math.floor((this.authService.fnGetUTCFormatDate()) - (+ele.LastSeen)) < 600000) {
        return true;
      } else {
        return false;
      }
    });

    this.activeWeabolsUserList.forEach((element: any) => {
      let watchRecord: any = this.fnFindWatchRecord(element);
      console.log("watchRecord", watchRecord, "Key user", element.key);
      // if (watchRecord != undefined) {
      element.watchKey = watchRecord == undefined ? "" : watchRecord.watchKey;
      element.BatteryHealth = watchRecord == undefined ? "" : watchRecord.BatteryHealth;
      element.BatteryIsCharging = watchRecord == undefined ? "" : watchRecord.BatteryIsCharging;
      element.BatteryLevel = watchRecord == undefined ? 0 : watchRecord.BatteryLevel;
      element.CellAccessPoint = watchRecord == undefined ? "" : watchRecord.CellAccessPoint;
      element.CellStatus = watchRecord == undefined ? "" : watchRecord.CellStatus;
      element.ConnectionType = watchRecord == undefined ? "" : watchRecord.ConnectionType;
      element.DeploymentKey = watchRecord == undefined ? "" : watchRecord.DeploymentKey;
      element.DeploymentName = watchRecord == undefined ? "" : watchRecord.DeploymentName;
      element.GPSAccuracy = watchRecord == undefined ? "" : watchRecord.GPSAccuracy;
      element.GPSAltitude = watchRecord == undefined ? "" : watchRecord.GPSAltitude;
      element.GPSClimb = watchRecord == undefined ? "" : watchRecord.GPSClimb;
      element.GPSDirection = watchRecord == undefined ? "" : watchRecord.GPSDirection;
      element.GPSHorizontal = watchRecord == undefined ? "" : watchRecord.GPSHorizontal;
      element.GPSLatitude = watchRecord == undefined ? "" : watchRecord.GPSLatitude;
      element.GPSLongitude = watchRecord == undefined ? "" : watchRecord.GPSLongitude;
      element.GPSSpeed = watchRecord == undefined ? "" : watchRecord.GPSSpeed;
      element.GPSVertical = watchRecord == undefined ? "" : watchRecord.GPSVertical;
      //element.GroupKey = watchRecord == undefined ? "" : watchRecord.GroupKey;
      //element.GroupName = watchRecord == undefined ? "" : watchRecord.GroupName;
      element.IsActive = watchRecord == undefined ? false : watchRecord.IsActive;
      element.IsAssigned = watchRecord == undefined ? false : watchRecord.IsAssigned;
      element.LastSeen = watchRecord == undefined ? element.LastSeen : watchRecord.LastSeen;
      element.LastSeenCloud = watchRecord == undefined ? "" : watchRecord.LastSeenCloud;
      element.ModelName = watchRecord == undefined ? "" : watchRecord.ModelName;
      element.NetworkType = watchRecord == undefined ? "" : watchRecord.NetworkType;
      element.OnlineStatus = watchRecord == undefined ? "offline" : watchRecord.OnlineStatus;
      element.OwnerKey = watchRecord == undefined ? "" : watchRecord.OwnerKey;
      element.OwnerName = watchRecord == undefined ? "" : watchRecord.OwnerName;
      element.ProviderName = watchRecord == undefined ? "" : watchRecord.ProviderName;
      element.UserKey = watchRecord == undefined ? element.key : watchRecord.UserKey;
      //element.UserName = watchRecord!=undefined?"":watchRecord.UserName;
      element.WatchID = watchRecord == undefined ? "" : watchRecord.WatchID;
      element.WiFiOnOff = watchRecord == undefined ? "" : watchRecord.WiFiOnOff;
      element.WiFiSSID = watchRecord == undefined ? "" : watchRecord.WiFiSSID;
      element.WiFiipAddress = watchRecord == undefined ? "" : watchRecord.WiFiipAddress;
      element.WiFisignalStrength = watchRecord == undefined ? "" : watchRecord.WiFisignalStrength;
      element.TizenVersion = watchRecord == undefined ? "" : watchRecord.TizenVersion;
      element.WearbolsVersion = watchRecord == undefined ? "" : watchRecord.WearbolsVersion;
      //}
    });

    //filter active list
    if (this.IsSelectOnline) {
      this.activeWeabolsUserList = this.activeWeabolsUserList.filter((ele: any) => {
        if (ele.OnlineStatus != "offline" && Math.floor((this.authService.fnGetUTCFormatDate()) - (+ele.LastSeen)) < 600000) {
          return true;
        } else {
          return false
        }
      });
    } else if (this.IsSelectOffline) {
      this.activeWeabolsUserList = this.activeWeabolsUserList.filter((ele: any) => {
        if (ele.OnlineStatus != "offline" && Math.floor((this.authService.fnGetUTCFormatDate()) - (+ele.LastSeen)) < 600000) {
          return false;
        } else {
          //return false
          return true;
        }
      });
    }

    //set logic for display
    this.activeWeabolsUserList.forEach((record: any) => {
      record.BatteryLevel = record.BatteryLevel == "" ? "0" : (+record.BatteryLevel).toString();
      //record.WiFiSSID = record.NetworkType == "WIFI" ? record.WiFiSSID : record.CellAccessPoint;
      record.WiFiSSID = record.NetworkType == "WIFI" ? record.WiFiSSID : record.CellAccessPoint;
      record.NetworkType = record.NetworkType;
      record.GPSAccuracy = (+record.GPSLatitude == 0 || record.GPSLatitude == null) && (+record.GPSLongitude == 0 || record.GPSLongitude == null) ? 'Off' : 'On';
      record.IsActive = record.LastSeen == "" || record.OnlineStatus == "offline" ? false : (Math.floor((this.authService.fnGetUTCFormatDate()) - (+record.LastSeen)) < 480000 ? true : false);
      record.LastSeen = record.LastSeen == "" ? "" : this.authService.fnDateTimeDifference(record.LastSeen);
      record.Details = "Info";
    });

    this.watchListTableBind.tableColDef = [
      { headerName: 'Online/Offline', width: '8%', internalName: 'IsActive', type: "online-offline", onClick: "No", applyColFilter: 'No' },
      { headerName: 'Name', width: '10%', internalName: 'UserName', sort: true, type: "", onClick: "" },
      { headerName: 'Group', width: '10%', internalName: 'GroupName', type: "", onClick: "" },
      { headerName: 'Comments', width: '15%', internalName: 'Comments', type: "", onClick: "" },
      { headerName: 'Last Seen', width: '10%', internalName: 'LastSeen', type: "", onClick: "" },
      { headerName: 'Network Type', width: '10%', internalName: 'NetworkType', type: "", onClick: "" },
      { headerName: 'Network Connection', width: '10%', internalName: 'WiFiSSID', type: "", onClick: "" },
      { headerName: 'GPS on/off', width: '10%', internalName: 'GPSAccuracy', type: "", onClick: "No" },
      { headerName: 'Battery Level', width: '10%', internalName: 'BatteryLevel', sort: true, type: "battery-level", applyColFilter: 'No' },
      { headerName: 'Details', width: '10%', internalName: 'Details', type: "button", onClick: "Yes" },
      { headerName: 'Enable/Disable', width: '10%', internalName: 'Enabled', type: "checkbox-switch", onClick: "Yes", applyColFilter: 'No' },
    ];

  }

  fnFindWatchRecord(record: any) {
    let selectedWatch: any;
    this.userListForStatus.every((rec: any, index: any, array: any[]) => {
      if (rec.UserKey == record.key) {
        // console.log("every rec", rec);
        selectedWatch = rec;
        if (rec.OnlineStatus == 'online') {
          return false;
        }
        //return false;
      } else {
        return true;
      }
    });

    return selectedWatch;
  }

  public watchListTableBind = {
    tableID: "watch-list-table",
    tableClass: "table table-border ",
    tableName: "Console User Status",
    tableRowIDInternalName: "WearableKey",
    tableColDef: [
      { headerName: 'Online/Offline', width: '8%', internalName: 'IsActive', type: "online-offline", onClick: "No", applyColFilter: 'No' },
      { headerName: 'Name', width: '10%', internalName: 'UserName', sort: true, type: "", onClick: "" },
      { headerName: 'Group', width: '10%', internalName: 'GroupName', type: "", onClick: "" },
      { headerName: 'Comments', width: '15%', internalName: 'Comments', type: "", onClick: "" },
      { headerName: 'Last Seen', width: '10%', internalName: 'LastSeen', type: "", onClick: "" },
      { headerName: 'Network Type', width: '10%', internalName: 'NetworkType', type: "", onClick: "" },
      { headerName: 'Network Connection', width: '10%', internalName: 'WiFiSSID', type: "", onClick: "" },
      { headerName: 'GPS on/off', width: '10%', internalName: 'GPSAccuracy', type: "", onClick: "No" },
      { headerName: 'Battery Level', width: '10%', internalName: 'BatteryLevel', sort: true, type: "battery-level", applyColFilter: 'No' },
      { headerName: 'Details', width: '10%', internalName: 'Details', type: "button", onClick: "Yes" },
      { headerName: 'Enable/Disable', width: '10%', internalName: 'Enabled', type: "checkbox-switch", onClick: "Yes", applyColFilter: 'No' },
    ],
    enabledSearch: true,
    enabledSerialNo: true,
    pageSize: 20,
    enabledCellClick: true,
    enabledPagination: false,
    enabledAutoScrolled: true,
    pTableStyle: {
      tableOverflowY: true,
      overflowContentHeight: '460px'
    }
  };
}
