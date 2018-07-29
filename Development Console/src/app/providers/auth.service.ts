import { Injectable, } from '@angular/core';
import { AngularFireModule } from 'angularfire2'
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireDatabaseModule, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise'
import { DatePipe } from "@angular/common"

@Injectable()
export class AuthService {
  static userDetails: any;
  static consoleUserDetails:any[]=[];
  user$: Observable<firebase.User>;
  items: FirebaseListObservable<any[]>;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    this.user$ = afAuth.authState;
    afAuth.authState.subscribe(rec => AuthService.userDetails = rec);
  }

  fnLoginWithGoogle() {
    // debugger;
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  fnLoginWithUserNamePassword(userName, password): Observable<any> {
    return Observable.fromPromise(
      this.afAuth.auth.signInWithEmailAndPassword(userName, password)
    );
  }

  fnLogout() {
    this.user$ = null;
    localStorage.removeItem("wearbolsConsoleLogin");
    return this.afAuth.auth.signOut();

  }
  fnGetUserDetails() {
    return AuthService.userDetails;
  }

  fnGetListData() {
    // debugger;
    this.items = this.db.list('UserList');
    return this.items;

  }

  isAuthenticated(): boolean {
    return this.user$ != undefined ? true : false;
  }

  formattedDateNow() {
    var dp = new DatePipe("en-US");
    return dp.transform(Date.now(), 'y/m/d HH:mm:ss');
  }

  fnGetUTCFormatDate() {
    var utcDate = new Date(new Date().getTime());
    return utcDate.getTime();
  }


  fnGetTableData(tableName): Observable<any[]> {
    const dataList$: FirebaseListObservable<any[]> = this.db.list(tableName);
    return dataList$;
  }

  fnGetDataUsingCustomQuery(tableName,query): Observable<any[]> {
    const dataList$: FirebaseListObservable<any[]> = this.db.list(tableName, {
      query:query
    });
    return dataList$;
  }

  fnSaveData(tableName, data) {
    const table = this.db.list(tableName);
    table.push(data);
  }

  fnDeleteData(tableName, key) {
    const table = this.db.list(tableName);
    table.remove(key)
  }

  fnUpdateData(tableName, key, data) {
    const table = this.db.list(tableName);
    table.update(key, data)
  }

  fnTriggerOnUpdate(tableName:string,triggerType:string="child_changed"){
    firebase.database().ref('/'+tableName).on(triggerType, c =>{
      return c.val();
    });
  }

  fnSaveDataWithCustomKey(DataWithLocation:any){
    // updates['/posts/' + newPostKey] = postData;
    firebase.database().ref().update(DataWithLocation);
  }


  fnDateTimeDifference(firstDate, currentDate: number = +this.fnGetUTCFormatDate()) {
    if(firstDate==0){
        return "Never";
    }
    
    let MIN_SECONDS = 60;
    let HOUR_SECONDS = 3600;
    let DAY_SECONDS = 86400;
    let FIVE_MINUTES = MIN_SECONDS * 5;
    var seconds = Math.floor((currentDate - (firstDate)) / 1000);
    var minutes = Math.round(seconds / MIN_SECONDS),
      hours = Math.round(seconds / HOUR_SECONDS),
      days = Math.round(seconds / DAY_SECONDS);
    if (days > 7) {
      return Math.round(days/7)+" Week ago";
    }
    else if (days > 0) {
      return days + "d ago";
    } else if (hours > 0 && minutes > 59) {
      return hours + "h ago";
    } else if (minutes >= 5) {
      return minutes + "m ago";
    } else {
      return "Just now";
    }
  }

  fnFindUniqueColumnWithCheckedFlag(objectSet: any[], findKey: any, ): any[] {
    var o = {}, i, l = objectSet.length, r = [];
    for (i = 0; i < l; i++) { o[objectSet[i][findKey]] = objectSet[i][findKey]; };
    for (i in o) r.push({ checked: true, data: o[i] });
    return r;
  } 
}
