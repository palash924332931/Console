import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FirebaseDb } from '../../shared/model/constants'
import { AuthService } from "../../providers/auth.service";
import { MessageTemplate } from '../../shared/model/message-template';
import { MultiMessageTemplate, MessageContent } from '../../shared/model/multipart-message';
import { AlertService } from "../../shared/components/alert/alert.service";
declare var jQuery: any;

@Component({
  selector: 'app-message-template-tab',
  templateUrl: './message-template-tab.component.html',
  styleUrls: ['./message-template-tab.component.css', '../../shared/css/common.css'],

})

export class MessageTemplateTabComponent implements OnInit {

  public messageTemplateGroup: FormGroup;
  public multipartMessage: any[] = [];
  public multipartMessageForView: MultiMessageTemplate[] = [];
  public newListName: string = "";
  public dropDownNext: any[] = [];
  public basicMessageMasterTemplateList = [{ Id: 0, Name: 'Base' }, { Id: 1, Name: 'What' }, { Id: 2, Name: 'When' }, { Id: 3, Name: 'Where' }, { Id: 4, Name: 'How Many' }, { Id: 5, Name: 'Who' }];
  public basicMessageTemplateList:any[]=[];
  constructor(private authService: AuthService, private formBuilder: FormBuilder, private firebaseDb: FirebaseDb, private alertService: AlertService) {
  }

  ngOnInit() {
    this.authService.fnGetTableData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable)).subscribe((rec: any) => {
      this.multipartMessage = rec || [];

      //to make next dropdown
      this.dropDownNext = [];
      this.dropDownNext.push("EOM")
      this.multipartMessage.forEach((re: any) => {
        if (re.name != 'Base') {
          this.dropDownNext.push(re.name)
        }
      });


      this.multipartMessage.forEach((record: any) => {
        let key = record.$key;
        record.key = key;
        if (record.messages != null) {
          if (!Array.isArray(record.messages)) {// to format the array
            let messageContent = [];
            for (var keys in record.messages) {
              Object.defineProperty(record.messages[keys], 'key', { value: keys.toString() });
              messageContent.push(record.messages[keys])
            }
            record.messages = messageContent;
          }
        }
      });

      this.multipartMessageForView = this.multipartMessage;
    });
  }

  fnGetMessageTemplates() {
    //this.authService.fnGetTableData(FirebaseDb.firebaseMessageTemplateTable).subscribe(x => this.messageTemplateList = x);
  }

  fnAddMultiMessageTemplate() {
    this.errorMessage = "";
    this.basicMessageTemplateList=[];
    this.basicMessageMasterTemplateList.forEach((rec:any)=>{
      let check=this.dropDownNext.filter((r:any)=>{if(rec.Name=='Base'?'EOM':rec.Name==r){return true}else{return false}})||[];
      if(check.length>0){

      }else{
        this.basicMessageTemplateList.push(rec);
      } 
    });
    jQuery("#addMultiMessageTemplate").modal("show");
    // setTimeout(() => {
    //  // jQuery("#templateMessageType").trigger("click");
    //   let length=jQuery("#templateMessageType > option").length;
    //   //jQuery("#templateMessageType").attr('size',length);
    //   jQuery("#templateMessageType").simulate("mousedown")
    //   //alert("Ok");
    // }, 3000);
    
  }

  public newMessage: string = "";
  public messageParentKey: string = "";
  public dropdownValueOfNext: string = "EOM";
  public dropDownNextAccordingToBlock: any[];
  fnActionOnMessageTemplate(actionType: string, message: MultiMessageTemplate) {
    this.errorMessage = "";
    if (actionType == 'Add') {
      this.newMessage = "";
      this.messageParentKey = message.key;
      this.dropdownValueOfNext = "EOM";
      this.dropDownNextAccordingToBlock = this.dropDownNext.filter((rec: any) => { if (rec == message.name) { return false } else { return true; } });
      jQuery("#AddNewMessage").modal("show");
      setTimeout(() => {
        jQuery("#txtNewMessage").focus();
      }, 800);

    }
    else if (actionType == 'Delete-All') {
      this.alertService.confirm("Do you want to delete this list?", () => {
        this.multipartMessageForView.forEach((rec: MultiMessageTemplate) => {
          if (rec.messages != null) {
            rec.messages.forEach((element: MessageContent) => {
              if (element.next == message.name) {
                this.authService.fnUpdateData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + "/" + rec.key + "/messages", element.key, { next: "EOM" });
              }
            });
          }
        });
        this.authService.fnDeleteData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + "/", message.key);
      }, function () {
        //ACTION: Do this if user says NO
      })
    }
  }

  private messageKey: string;
  public editMessageText: string;
  public errorMessage: string;

  fnUpdateMessage() {
    this.authService.fnUpdateData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable), this.messageKey, { MsgText: this.editMessageText });
    jQuery("#editMessageTemplate").modal("hide");
  }

  fnDeleteMessageContent(message: any, parentKey: string) {
    let countNumberOfMessage: number = 0;
    this.multipartMessageForView.forEach((record: any) => {
      if (record.key == parentKey) {
        countNumberOfMessage = record.messages.length;
      }
    });

    if (countNumberOfMessage <= 1) {
      this.alertService.alertAutoTerminated("This list has only one message. You can't delete this message.");
    } else {
      this.authService.fnDeleteData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + "/" + parentKey + "/messages", message.key);
    }

  }

  fnCreateNewList() {
    let templateBaseName = jQuery("#templateMessageType :selected").text();
    let templateBaseId = jQuery("#templateMessageType").val();
    // to check this list already exists
    let templateExists = false;
    this.multipartMessageForView.forEach((record: any) => {
      if (record.key == templateBaseId) {
        templateExists = true;
      }
    });

    if (templateExists) {
      this.errorMessage = "Template " + templateBaseName + " already exists. Please select another one."
      return false;
    }

    var updates = {};
    updates[this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + "/" + templateBaseId] = { name: templateBaseName };
    this.authService.fnSaveDataWithCustomKey(updates);
    this.authService.fnSaveData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + '/' + templateBaseId + '/messages', { next: 'EOM', messageContent: 'Default Message' })
    jQuery("#addMultiMessageTemplate").modal("hide");
  }

  fnCreateNewMessage() {
    if (this.newMessage == null || this.newMessage == "") {
      this.errorMessage = "Message can't empty.";
      return false;
    }
    this.authService.fnSaveData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + '/' + this.messageParentKey + '/messages', { next: this.dropdownValueOfNext, messageContent: this.newMessage })
    jQuery("#AddNewMessage").modal("hide");
  }

  fnUpdateMessageContent(message: any, parentKey: string) {
    let updateMessageContent = jQuery("#txt-" + message.key).val();
    let updateNextItem = jQuery("#dropdown-" + message.key).val();

    jQuery("#dropdown-" + message.key).css("background-color", "#fff");
    jQuery("#txt-" + message.key).css("background-color", "#fff");

    this.authService.fnUpdateData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + '/' + parentKey + '/messages', message.key, { next: updateNextItem, messageContent: updateMessageContent });
    this.alertService.alertAutoTerminated("Your imformation saved successfully.");
  }
  fnSaveAllMessage(baseName: any) {
    let changeDetect:boolean=false;
    baseName.messages.forEach((rec: any) => {
      let updateMessageContent = jQuery("#txt-" + rec.key).val();
      let updateNextItem = jQuery("#dropdown-" + rec.key).val();
      if (rec.messageContent != updateMessageContent || rec.next!=updateNextItem) {
        changeDetect=true;
        jQuery("#dropdown-" + rec.key).css("background-color", "#fff");
        jQuery("#txt-" + rec.key).css("background-color", "#fff");
        this.authService.fnUpdateData(this.firebaseDb.fnListNameWithRoot(FirebaseDb.firebaseMessageTemplateTable) + '/' + baseName.key + '/messages', rec.key, { next: updateNextItem, messageContent: updateMessageContent });
      }
    });
    if(changeDetect){
      this.alertService.alertAutoTerminated("All message updated of "+baseName.name+ " template." );
    }else{
      this.alertService.alertAutoTerminated("Nothing has changed in "+baseName.name+" template" );
    }    
  }

  fnChangeDetectionOfMessage(type: any, prevData: any, txtId: any) {
    if (type == "message") {
      if (prevData.messageContent != jQuery("#" + txtId).val()) {
        jQuery("#" + txtId).css("background-color", "#e2e2b8");
      } else {
        jQuery("#" + txtId).css("background-color", "#fff");
      }
    } else {
      if (prevData.next != jQuery("#" + txtId).val()) {
        jQuery("#" + txtId).css("background-color", "#e2e2b8");
      } else {
        jQuery("#" + txtId).css("background-color", "#fff");
      }
    }

  }
}
