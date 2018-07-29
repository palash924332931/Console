import { Component, OnInit, AfterViewInit,DoCheck } from '@angular/core';
import { FirebaseDb } from "../../shared/model/constants"
import { AuthService } from "../../providers/auth.service";
import { Observable } from 'rxjs/Rx';
declare var jQuery: any;
@Component({
  selector: 'app-maps-tab',
  templateUrl: './maps-tab.component.html',
  styleUrls: ['./maps-tab.component.css']
})
export class MapsTabComponent implements OnInit, AfterViewInit,DoCheck {
  public zoom:number=8;
  public currentWatchList: any[] = [];
  public lat: number = 231.783726;
  public lng: number = 901.41251809999994;

  constructor(private authService: AuthService,private fBList:FirebaseDb) { }

  ngOnInit() {
    let customQuery = {
      orderByChild: "OnlineStatus",
      equalTo: "online",
      limitToLast: 5000,
    }
    this.authService.fnGetDataUsingCustomQuery(this.fBList.fnListNameWithRoot(FirebaseDb.firebaseWatchInformationTable), customQuery).subscribe(
      (rec: any) => {
        this.currentWatchList = [];
        rec.forEach((reccord: any) => {
          reccord.key = reccord.$key;
        });

        this.currentWatchList = rec.filter((record: any) => { if (record.Langitude != null && record.Latitude != null) { return true } else { return false } });
        //console.log(this.currentWatchList);
        this.lat=this.currentWatchList[0].Latitude;
        this.lng=this.currentWatchList[0].Langitude;
      });


  }

  ngAfterViewInit() {

    setTimeout(function () {
      //jQuery(".gm-style div").css("background-color",'red');
      jQuery(".gm-style div").css({ 'color': 'blue', 'font-seze': '17px', 'font-weight': 'bold' });
    }, 1500);
    // Observable.interval(100 * 60).subscribe(x => {
    //   console.log("call method");
    //   //jQuery(".gm-style div").css("background-color",'red');
    //   jQuery(".gm-style div").css({'color':'blue','font-seze':'17px','font-weight':'bold'});
    // });


  }

  ngDoCheck(){
    setTimeout(function () {
      //console.log("call method");
      //jQuery(".gm-style div").css("background-color",'red');
      jQuery(".gm-style div").css({ 'color': 'blue', 'font-seze': '17px', 'font-weight': 'bold' });
    }, 1000);
  }

}
