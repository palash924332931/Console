import { Injectable } from '@angular/core'; 
import { Router, NavigationStart } from '@angular/router'; 
import { Observable } from 'rxjs'; 
import { Subject } from 'rxjs/Subject';
@Injectable() 
export class AlertService {
     private subject = new Subject<any>();
     constructor(){}
     confirm(message: string,siFn:()=>void,noFn:()=>void,type:string='confirm'){
       this.setConfirmation(message,siFn,noFn,type);
     }

     alert(message: string,siFn:()=>void=null,noFn:()=>void=this.closeFn,type:string='alert'){
        this.setConfirmation(message,siFn,noFn,type);
     }
     alertAutoTerminated(message: string,siFn:()=>void=null,noFn:()=>void=this.closeFn,type:string='alert-terminated'){
        this.setConfirmation(message,siFn,noFn,type);
     }
     setConfirmation(message: string,siFn:()=>void,noFn:()=>void,type:string) {
       let that = this;
       this.subject.next({ type: type,
                   text: message,
                   siFn:
                   function(){
                       that.subject.next(); //this will close the modal
                       siFn();
                   },
                   noFn:function(){
                       that.subject.next();
                       noFn();
                   }
                });

                if(type=="alert-terminated"){
                    setTimeout(() => {
                        this.subject.next();
                    }, 2000);
                }

            }
    closeFn=function(){

    };
     getMessage(): Observable<any> {
        return this.subject.asObservable();
      }
     }