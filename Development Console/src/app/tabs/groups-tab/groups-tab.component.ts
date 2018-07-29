import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../providers/auth.service";
import { Group } from "../../shared/model/group";
import { DatePipe } from "@angular/common"
import { FirebaseDb } from "../../shared/model/constants"
import { AlertService } from "../../shared/components/alert/alert.service";
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
declare var jQuery: any;

@Component({
  selector: 'app-groups-tab',
  templateUrl: './groups-tab.component.html',
  styleUrls: ['./groups-tab.component.css']
})

export class GroupsTabComponent implements OnInit {
  editGroupDescription: any;
  editGroupName: any;
  editGroupKey: any;
  isEditing: boolean;
  editComment: any;
  editFullName: any;
  editUserName: any;
  editUserGroup: any;
  editUserKey: any;
  userForm: FormGroup;
  public bindUserTable: any;
  public bindGroupsTable: any;
  public userTab = "Manage User";
  public groupTab = "Manage Group";
  public isGroupEnabled: boolean;
  public groupList: any[] = [];
  public selectedGroup: any = null;
  errorMessage: string = "";
  editErrorMessage: string = "";
  settingsDetails: any;
  groupEnabled: boolean;

  public selectedTab: string;
  public homeTabs: any[];

  public recommendedUserNameLength: number = 20;

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private fBList: FirebaseDb, private alertService: AlertService) {
    this.userForm = this.formBuilder.group({
      'userName': ['', Validators.required],
      'fullName': ['', ''],
      'comment': ['', '']
    })
  }

  ngOnInit() {
    if (this.authService.afAuth.auth.currentUser == null) {
      return;
    }

    var ta = FirebaseDb.firebaseSettingsTable;
    var settingsRef = this.authService.db.database.ref(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable) + "/" +
      this.authService.afAuth.auth.currentUser.uid);

    var settings;
    this.fnBindGroupTable();
    this.fnBindUserTable();

    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseSettingsTable)).subscribe((rec: any) => {
      this.settingsDetails = rec[0];
      this.groupEnabled = this.settingsDetails.GroupEnabled != undefined ? this.settingsDetails.GroupEnabled : false;
      if (this.groupEnabled) {
        this.selectedTab = this.groupTab;
        this.homeTabs = [{ tabName: this.groupTab }, { tabName: this.userTab }]
      } else {
        this.selectedTab = this.userTab;
        this.homeTabs = [{ tabName: this.userTab }]
      }
    });
  }


  fnSelectTab(tab: string) {
    this.selectedTab = tab;
  }

  public NewGroup: Group = {
    name: "",
    description: ""
  }

  fnResetNewGroupFields() {
    this.NewGroup.name = "";
    this.NewGroup.description = "";
  }

  fnCreateGroup() {
    if (this.NewGroup.name !== null || this.NewGroup.name !== "") {
      this.authService.db.database.ref(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseGroupTable)).push().set({
        GroupName: this.NewGroup.name,
        GroupDescription: this.NewGroup.description,
        DeploymentKey: "000",
        CreatedDate: this.authService.fnGetUTCFormatDate(),
        CreatedBy: this.authService.afAuth.auth.currentUser.uid
      });
      this.fnResetNewGroupFields();
    }
  }

  formattedDateNow() {
    var dp = new DatePipe("en-US");
    return dp.transform(Date.now(), 'y/m/d HH:mm:ss');
  }

  fnSelectUserGroup(group) {
    this.selectedGroup = group;
  }

  fnCanCreateUser() {
    if (this.isGroupEnabled) {
      return this.userForm.valid && this.selectedGroup != null;
    }
    else {
      return this.userForm.valid;
    }
  }

  fnCreateUser(user) {
    if (user.userName == null || user.userName == "") {
      return;
    }

    var doesUserNameExistQuery = this.fnDoesUserNameExist(user.userName);

    doesUserNameExistQuery.once("value", data => {
      // console.log(data);
      // console.log(data.val());
      if (data.val() == null) {
        // user name does not exist
        this.authService.fnSaveData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), {
          UserName: user.userName,
          FullName: user.fullName == null ? "" : user.fullName,
          Comment: user.comment == null ? "" : user.comment,
          CreatedDate: this.authService.fnGetUTCFormatDate(),
          GroupKey: this.selectedGroup == null ? 111 : this.selectedGroup.key,
          GroupName: this.selectedGroup == null ? "Default" : this.selectedGroup.GroupName,
          RoleKey: 222,
          OnlineStatus: "offline",
          LastSeen: 0,
          Enabled: true,
          HasUnreadMessage :false,
        })
        this.errorMessage = "";
        this.userForm.reset();
        this.selectedGroup = null;
      }
      else {
        // user name exists
        this.errorMessage = "User Name already exists";
      }
    });
  }

  fnOnUserNameChange(newUserName) {
    if (this.userForm.controls.userName.value != newUserName) {
      this.errorMessage = "";
    }
  }

  fnDoesUserNameExist(userName) {
    var uniqueUserQuery = {
      orderByChild: "UserName",
      equalTo: userName,
      limitToLast: 1,
    }

    var user: any = null;

    var userRef = this.authService.db.database.ref().child(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable));

    return userRef.orderByChild("UserName").equalTo(userName);
  }

  fnHasUserNameMessage(isEditing) {
    return this.fnIsUserNameBiggerThanRecommendedLength(isEditing) || this.errorMessage != ""
      || this.editErrorMessage != "";
  }

  fnGetUserNameMessage(isEditing) {
    if (this.fnIsUserNameBiggerThanRecommendedLength(isEditing)) {
      return "User name bigger than recommended length. It may overflow on watch screen";
    }

    if (isEditing) {
      if (this.editErrorMessage != "") {
        return this.editErrorMessage;
      }
    }
    else {
      if (this.errorMessage != "") {
        return this.errorMessage;
      }
    }
  }

  fnIsUserNameBiggerThanRecommendedLength(isEditing: boolean): boolean {
    var userName = isEditing ? this.editUserName : this.userForm.controls.userName.value;

    if (userName != null) {
      return userName.length > this.recommendedUserNameLength;
    }
    else {
      return false;
    }
  }

  public userList: any[] = [];

  fnBindUserTable() {
    this.bindUserTable = {
      tableID: "WearbolsUser",
      tableClass: "table table-border ",
      tableName: "Wearbols User List",
      tableRowIDInternalName: "NodeCode",
      tableColDef: [
        { headerName: 'User Name', width: '20%', internalName: 'UserName', className: "territory-list-code", sort: true, type: "", onClick: "" },
        {
          headerName: 'Group', width: '15%', internalName: 'GroupName', className: "territory-list-bricks", sort: true, type: "", onClick: "Yes",
          visible: this.isGroupEnabled
        },
        { headerName: 'Name ', width: '20%', internalName: 'FullName', className: "territory-list-territory", type: "", onClick: "", applyColFilter: true },
        { headerName: 'Comment ', width: '23%', internalName: 'Comment', className: "territory-list-territory", type: "", onClick: "", applyColFilter: true },
        { headerName: 'Created On', width: '12%', internalName: 'CreatedDate', className: "territory-list-bricks", sort: false, type: "", onClick: "Yes", applyColFilter: false },
      ],
      enabledSearch: true,
      enabledPagination: false,
      enabledCellClick: true,
      enabledEditBtn: true,
      enabledAutoScrolled: true,
      pTableStyle: {
        tableOverflowY: true,
        overflowContentHeight: '350px'
      }
    };

    this.fnGetAllUsers();
  }

  fnGetAllUsers() {
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable)).subscribe((user: any) => {
      this.userList = [];
      user.forEach((element: any) => {
        element.key = element.$key;
        //element.CreatedDate = this.authService.fnDateTimeDifference(element.CreatedDate);
        //this.userList.push(element);
      });
      this.userList = JSON.parse(JSON.stringify(user)) || [];
      this.userList.forEach((rec: any) => {
        rec.CreatedDate = this.authService.fnDateTimeDifference(rec.CreatedDate);
      });

      //filter for null user 
      this.userList = this.userList.filter((record: any) => {
        if (record.UserName != null && record.UserName != "") {
          return true;
        } else {
          return false;
        }
      });
    });
  }

  fnBindGroupTable() {
    this.bindGroupsTable = {
      tableID: "WearbolsGroupList",
      tableClass: "table table-border ",
      tableName: "Wearbols Group List",
      tableRowIDInternalName: "NodeCode",
      tableColDef: [
        { headerName: 'Group Name', width: '40%', internalName: 'GroupName', className: "territory-list-code", sort: true, type: "", onClick: "" },
        { headerName: 'Description', width: '35%', internalName: 'GroupDescription', className: "territory-list-bricks", sort: true, type: "", onClick: "Yes" },
        // { headerName: 'Deployment Key', width: '25%', internalName: 'DeploymentKey', className: "territory-list-bricks", sort: true, type: "", onClick: "Yes" },
        { headerName: 'Created On', width: '15%', internalName: 'CreatedDate', className: "territory-list-bricks", sort: true, type: "", onClick: "Yes" },
      ],
      enabledSearch: true,
      enabledPagination: false,
      enabledCellClick: true,
      enabledEditBtn: true,
    };

    this.fnGetAllGroups();
  }

  fnGetAllGroups() {
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseGroupTable)).subscribe((rec: any) => {
      this.groupList = [];
      rec.forEach((element: any) => {
        element.key = element.$key;
      });

      this.groupList = JSON.parse(JSON.stringify(rec)) || [];
      this.groupList.forEach((rec: any) => {
        rec.CreatedDate = this.authService.fnDateTimeDifference(rec.CreatedDate);
      });

      //to filter null value
      this.groupList = this.groupList.filter((record: any) => {
        if (record.GroupName != null && record.GroupName != "") {
          return true;
        } else {
          return false;
        }
      });


    });
  }

  fnActivityUserList($event) {
    this.editUserKey = $event.record.key;
    this.editErrorMessage = "";

    if ($event.action === "edit-item") {
      this.editUserName = $event.record.UserName;
      this.editFullName = $event.record.FullName;
      this.editComment = $event.record.Comment;
      this.editUserGroup = { GroupName: $event.record.GroupName };
      this.isEditing = true;
      this.fnShowEditDialog();
    }
    else if ($event.action === "delete-item") {
      this.alertService.confirm("Do you want to delete user '" + $event.record.UserName + "'?"
        , () => {
          this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), this.editUserKey);
        }
        , function () {

        });

    }
  }

  fnShowEditDialog() {
    jQuery("#modalDialog").modal("show");
  }

  fnHideEditDialog() {
    jQuery("#modalDialog").modal("hide");
  }

  fnSelectEditUserGroup(group) {
    this.editUserGroup = group;
  }

  fnCanUpdateUser() {
    return this.editUserName !== "" && this.editUserGroup !== null;
  }

  fnUpdateUser() {
    var uniqueUserQuery = this.fnDoesUserNameExist(this.editUserName);
    uniqueUserQuery.once("value", data => {
      var doesUserNameExist = false;
      if (data.val() != null) {
        // data holds user under "user key" as property,
        // so using object.keys to get the "property name"/"user key"
        doesUserNameExist = Object.keys(data.val())[0] != this.editUserKey;
      }

      if (data.val() == null || !doesUserNameExist) {
        this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable),
          this.editUserKey, {
            UserName: this.editUserName,
            FullName: this.editFullName == null ? "" : this.editFullName,
            Comment: this.editComment == null ? "" : this.editComment,
            GroupName: this.editUserGroup.GroupName
          });

        this.isEditing = false;
        this.fnHideEditDialog();
      }
      else {
        this.editErrorMessage = "User name already exists";
      }
    });
  }

  public IsGroupDelete: boolean = false;
  fnActivityGroupList($event) {
    this.editGroupKey = $event.record.key;
    if ($event.action === "edit-item") {
      this.editGroupName = $event.record.GroupName;
      this.editGroupDescription = $event.record.GroupDescription;

      this.fnShowEditDialog();
    }
    else if ($event.action === "delete-item") {
      //to find is group associated or not
      this.IsGroupDelete = true;
      let customQuery = {
        orderByChild: "GroupKey",
        equalTo: this.editGroupKey
      }

      this.authService.fnGetDataUsingCustomQuery(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), customQuery).subscribe((rec: any) => {
        if (this.IsGroupDelete) {
          this.IsGroupDelete = false;
          let userListOfSpecificGroup = [];
          if (rec.length > 0) {
            rec.forEach((element: any) => {
              userListOfSpecificGroup.push(element.UserName);
            });
            this.alertService.confirm("If you delete group <b>" + $event.record.GroupName + "</b> associated user <b>" + userListOfSpecificGroup + "</b> also will be deleted. Do you want to delete? ",
              () => {
                //to delete user from user list
                rec.forEach((element: any) => {
                  this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable), element.$key);
                });

                //to delete group from list
                this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseGroupTable), this.editGroupKey);
              },
              () => { });
          } else {
            //to confirm 
            this.alertService.confirm("Do you want to delete <b>" + $event.record.GroupName + "</b> group?",
              () => {
                this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseGroupTable), this.editGroupKey);
                this.fnGetAllUsers();
              },
              function () {
                //error
              });
          }
        }
      });
      // }



    }
  }

  fnUpdateGroup() {
    this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseGroupTable),
      this.editGroupKey, {
        GroupName: this.editGroupName,
        GroupDescription: this.editGroupDescription
      });

    this.fnHideEditDialog();
  }

  fnOnEditUserNameChange(newUserName) {
    // if(this.editUserName !== newUserName){
    this.editErrorMessage = "";
    // }
  }
}
