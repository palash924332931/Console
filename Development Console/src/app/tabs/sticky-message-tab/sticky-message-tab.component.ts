import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserList } from '../../shared/model/user-list'
import { AuthService } from "../../providers/auth.service";
import { FirebaseDb } from "../../shared/model/constants"
import { AlertService } from "../../shared/components/alert/alert.service";
declare var jQuery: any;



@Component({
  selector: 'app-sticky-message-tab',
  templateUrl: './sticky-message-tab.component.html',
  styleUrls: ['./sticky-message-tab.component.css']
})

export class StickyMessageTabComponent implements OnInit {
  //@ViewChild('myModal') myModal:ElementRef;
  public templateMessage: any[] = [];
  public customMessageEnabled: boolean = false;
  public templateMessageEnabled: boolean = false;
  public activeWeabols: UserList[] = [];
  public activeWeabolsUser: any[] = [];
  public templateMessageArray = [];
  public userDetails: any;
  public stickyNotesList: any[];
  public stickyNoteTitles: any[];
  public stickyNotesArray: any[] = [];
  constructor(private authService: AuthService, private fBList: FirebaseDb, private alertService: AlertService) { }

  ngOnInit() {
    this.userDetails = this.authService.fnGetUserDetails();
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseStickyNoteTable)).subscribe(rec => {
      this.stickyNotesArray = [];
      this.stickyNotesList = rec;
      this.stickyNoteTitles = this.fnFindUniqueColumnWithCheckedFlag(this.stickyNotesList, 'Title') || [];

      this.stickyNoteTitles.forEach(record => {
        let notesUnderGroup = this.stickyNotesList.filter(rec => { if (rec.Title == record.data && rec.Message != "") { return true } else { return false } }) || [];
        if (notesUnderGroup.length > 0) {
          this.stickyNotesArray.push({ StickyTitle: record.data, StickyNotes: notesUnderGroup })
        }
      });

    });
    this.authService.fnGetTableData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseUserListTable)).subscribe(rec => {
      this.activeWeabols = rec;
      this.activeWeabols.forEach(record => { this.activeWeabolsUser.push({ UserName: record.UserName, Userkey: record.Userkey, Selected: false }) });
    });
  }

  public newTitleTxt: string = "";
  public newNotes: any = "";
  public IsEditNotes: boolean = false;
  public NoteKey: string;
  public updateMessageTxt: string;

  fnAddNewTitleModal() {
    this.newTitleTxt = "";
    this.IsEditNotes = false;
    jQuery("#myModal").modal("show");
  }

  fnAddNewTitle() {
    let title = { Title: this.newTitleTxt, Message: "", CreatedBy: this.userDetails.email };
    this.authService.fnSaveData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseStickyNoteTable), title);
    jQuery("#myModal").modal("hide");
    //alert("Title added successfully.");
  }

  fnAddNewNotes() {
    if (this.newNotes.trim() != "") {
      let title = { Title: jQuery("#templateMessageSelect").val(), Message: this.newNotes, CreatedBy: this.userDetails.email };
      this.authService.fnSaveData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseStickyNoteTable), title);
      this.alertService.alert("Sticky note added successfully.");
      this.newNotes = "";
    } else {
      this.alertService.alert("Please write your notes here.");
    }
  }


  fnFindUniqueColumnWithCheckedFlag(objectSet: any[], findKey: any, ): any[] {
    var o = {}, i, l = objectSet.length, r = [];
    for (i = 0; i < l; i++) { o[objectSet[i][findKey]] = objectSet[i][findKey]; };
    for (i in o) r.push({ checked: true, data: o[i] });
    return r;
  }

  fnActionOnStickyNotes(action: string, data: any) {
    this.NoteKey = data.$key;
    if (action == 'delete') {
      this.alertService.confirm("Do you want to delete this note?", () => {
        this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseStickyNoteTable), this.NoteKey);
      }, function () {
        //click no
      });

    } else if (action == 'edit') {
      this.IsEditNotes = true;
      this.newTitleTxt = data.Message;
      this.updateMessageTxt = data.Message;
      jQuery("#myModal").modal("show");
    }
  }

  fnDeleteStickyNotesHeader(title: string) {
    this.alertService.confirm("Do you want to delete " + title + "? It will delete all information under this title.", () => {
      this.stickyNotesList.filter(rec => {
        if (rec.Title == title) {
          this.authService.fnDeleteData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseStickyNoteTable), rec.$key);
        }
      });
    }, function () {
      //click no
    }
    );

  }

  fnUpdateNotes() {
    this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseStickyNoteTable), this.NoteKey, { Message: this.updateMessageTxt });
    jQuery("#myModal").modal("hide");
    this.IsEditNotes = false;
  }
  fnHTMLDecode(message: string) {
    message = message.replace(/\n\r?/g, '<br/>');
    return message;
  }
}
