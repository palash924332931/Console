import { Component, OnInit } from '@angular/core';
import { MessageHistory } from '../../shared/model/message-history'
import { AuthService } from "../../providers/auth.service";
import { FirebaseDb } from "../../shared/model/constants"

declare var jQuery: any;

@Component({
  selector: 'app-live-feed',
  templateUrl: './live-feed.component.html',
  styleUrls: ['./live-feed.component.css']
})
export class LiveFeedComponent implements OnInit {
  public consoleUserMessage:MessageHistory[] = [];
  public consoleSentUserMessage:MessageHistory[] = [];
  public consoleUserMessageTemp:MessageHistory[] = [];
  public consoleUserViewableMessage:MessageHistory[]=[];
  public selectedMessage: string;
  public selectedMessageKey: string;
  public selectedMessageStatus: string;
  public consoleUser: any = JSON.parse(localStorage.getItem('wearbolsConsoleLogin'));
  showReveivedMessage:boolean=true;
  showSentMessage:boolean=false;
  showAllMessage:boolean=false;

  IsFirstLoadOfReceivedMessage:boolean=true;
  IsFirstLoadOfSentMessage:boolean=true;

  constructor(private authService: AuthService,private fBList:FirebaseDb) { }

  ngOnInit() {
    //console.log("consoleUser", this.consoleUser);
    let customQuery = {
     // orderByChild: "ReceivedByName",
     // equalTo: this.consoleUser.UserName,
      orderByChild: "ReceivedByKey",
      equalTo: this.consoleUser.key,
      limitToLast: 5000,
    }
    this.authService.fnGetDataUsingCustomQuery(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), customQuery).subscribe(
      (rec: any) => {
        this.consoleUserMessage = [];
        rec.forEach((reccord: any) => {
          reccord.key = reccord.$key;
        });

        this.consoleUserMessage = JSON.parse(JSON.stringify(rec));       
        this.fnLoadMessageFeed();
      });


    //console user sent message
    let customQuerySent = {
      //orderByChild: "SentByName",
      //equalTo: this.consoleUser.UserName,
      orderByChild: "SentByKey",
      equalTo: this.consoleUser.key,
      limitToLast: 5000,
    }

    this.authService.fnGetDataUsingCustomQuery(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), customQuerySent).subscribe(
      (rec: any) => {
        this.consoleSentUserMessage = [];
        rec.forEach((reccord: any) => {
          reccord.key = reccord.$key;
        });

        this.consoleSentUserMessage = JSON.parse(JSON.stringify(rec));
        this.fnLoadMessageFeed();
      });
  }


  public selectedMessageDetails:any;
  fnShowDetailsOfMessage(data: MessageHistory) {
    this.selectedMessageKey = data.key;
    this.selectedMessageDetails=data;
    if (data.Status == 'Unread' && data.ReceivedByName==this.consoleUser.UserName) {
      this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), this.selectedMessageKey, { Status: 'Read' });
    }

    this.selectedMessage = data.MsgText;
    this.selectedMessageStatus = data.Status;
    jQuery("#messageActivity").modal("show");
  }

  fnChangeStatus(Status) {
    this.authService.fnUpdateData(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseMessageHistoryTable), this.selectedMessageKey, { Status: Status });
    jQuery("#messageActivity").modal("hide");

  }

  fnCheckRadio(event:any, type:string){
      if(type=="ReceivedMessage" && event==true){
        this.showReveivedMessage=true;
        this.showSentMessage=false;
        this.showAllMessage=false;
        this.fnLoadMessageFeed();
      }else if(type=="SentMessage" && event==true){
        this.showReveivedMessage=false;
        this.showSentMessage=true;
        this.showAllMessage=false;
        this.fnLoadMessageFeed();
      }
      else if(type=="EitherMessage" && event==true){
        this.showReveivedMessage=false;
        this.showSentMessage=false;
        this.showAllMessage=true;
        this.fnLoadMessageFeed();
      }
  }

  fnLoadMessageFeed(){
    this.consoleUserViewableMessage=[];
    if(this.showReveivedMessage){
      this.consoleUserViewableMessage=JSON.parse(JSON.stringify(this.consoleUserMessage));      
    }else if( this.showSentMessage){
      this.consoleUserViewableMessage=JSON.parse(JSON.stringify(this.consoleSentUserMessage));
    }else if( this.showAllMessage){
      this.consoleUserViewableMessage=JSON.parse(JSON.stringify(this.consoleUserMessage)).concat(JSON.parse(JSON.stringify(this.consoleSentUserMessage)));
    }

    this.consoleUserViewableMessage = this.consoleUserViewableMessage.sort((n1, n2) => {
      if (n1["SentDate"] < n2["SentDate"]) { return 1; }
      if (n1["SentDate"] > n2["SentDate"]) { return -1; }
      return 0;
    });

    this.consoleUserViewableMessage.forEach((record: any) => {
      record.SentDate = this.authService.fnDateTimeDifference(record.SentDate);
    });
  }

}
