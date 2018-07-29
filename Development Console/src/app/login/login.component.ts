import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService } from '../providers/auth.service'
import { DeploymentAdmin } from '../shared/model/deployment-admin';
import { FirebaseDb } from '../shared/model/constants'
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Input } from '@angular/core/src/metadata/directives';
import { AlertService } from "../shared/components/alert/alert.service";

declare var jQuery;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  name: FormControl;
  password: FormControl;
  errorMgs: string = "";
  loginUser: any;
  clickedLoginBtn: boolean = false;
  listOfDeploymentKey: any[] = [];//[{ deploymentKey: "25112017ABC001", creationDate: "12/12/2018" }, { deploymentKey: "10002", creationDate: "12/12/2018" }];
  constructor(public authService: AuthService, private formBuilder: FormBuilder, private router: Router, private alertService: AlertService) {
    this.loginForm = this.formBuilder.group({
      'email': ['', Validators.required],
      'password': ['', Validators.required],
    });

    //, ValidationService.emailValidator
  }

  ngOnInit() {
    this.authService.fnLogout();
  }

  loginFormSubmit(post) {
    let userName = post.email;
    let password = post.password;
    this.login(userName, password);
  }

  login(userName, password) {
    this.clickedLoginBtn = true;
    localStorage.removeItem("wearbolsConsoleLogin");
    try {
      this.errorMgs = "";
      this.authService.fnLoginWithUserNamePassword(userName, password)
        .subscribe(
        (success: any) => {
          //need to pull wearbols key..
          this.authService.fnGetDataUsingCustomQuery(FirebaseDb.firebaseDeploymentAdminTable,
            {
              orderByChild: "UserEmail",
              equalTo: success.email,
              limitToLast: 1
            })
            .subscribe(
            (data: DeploymentAdmin[]) => {
              debugger;
              if (data.length > 0) {
                this.listOfDeploymentKey = [];
                if (data[0].DeploymentList != undefined && data[0].DeploymentList != null) {
                  this.loginUser = data[0];
                  if (typeof data[0].DeploymentList == "object") {
                    for (let key in data[0].DeploymentList) {
                      if (data[0].DeploymentList.hasOwnProperty(key)) {
                        this.listOfDeploymentKey.push(data[0].DeploymentList[key]);
                      }
                    }

                  } else {
                    data[0].DeploymentList.forEach((element: any) => {
                      this.listOfDeploymentKey.push(element)
                    });
                  }
                  if (this.clickedLoginBtn) {
                    this.listOfDeploymentKey=this.listOfDeploymentKey.filter((rec:any)=>{
                      if(rec.IsArchived){
                        return false;
                      }else{
                        return true;
                      }
                    });
                    jQuery("#deploymentListModalDialog").modal("show");
                    this.clickedLoginBtn = false;
                  }
                  //this.router.navigate(['home']);
                } else {
                  this.errorMgs = "You have no permission to access any deployment. Please contact with admin.";
                  this.clickedLoginBtn = false;
                }

              } else {
                this.errorMgs = "You have no permission to access any deployment. Please contact with admin.";
                this.clickedLoginBtn = false;
              }

            },
            (error: any) => {
              this.clickedLoginBtn = false;
              //alert("alert");
            }
            );
          //this.router.navigate(['home'])
        },
        (error: any) => { this.clickedLoginBtn = false; this.errorMgs = "Invalid user name & password"; }
        );
    } catch (ex) {
      this.clickedLoginBtn = false;
      this.errorMgs = "Invalid user name & password";
    }

    // this.authService.fnLoginWithGoogle().then((data:any)=>{
    //   this.router.navigate(['home']);
    // })
  }
  fnActivityOnRecord(event: any) {
    this.clickedLoginBtn=false;
    jQuery("#deploymentListModalDialog").modal("hide");
    this.alertService.confirm("Do you want to login using deployment " + event.record.DeploymentName + "?", () => {
      FirebaseDb.deploymentKey = event.record.DeploymentKey;
      FirebaseDb.rootOfDeployment = "Deployments/" + event.record.DeploymentKey;
      localStorage.setItem('wearbolsConsoleLogin', JSON.stringify({ key: this.loginUser.$key, uid: "", email: this.loginUser.UserEmail, deploymentKey: event.record.DeploymentKey, deploymentName: event.record.DeploymentName, accountType: this.loginUser.AccountType, UserEmail: this.loginUser.UserEmail, UserName: this.loginUser.UserName }));
      //localStorage.setItem('wearbolsConsoleLogin', JSON.stringify(UserDetails));
      this.router.navigate(['home'])
    }, () => {
      jQuery("#deploymentListModalDialog").modal("show");
    });
  }

  public deploymentKeyTableBind = {
    tableID: "messtage-history-table",
    tableClass: "table table-border ",
    tableName: "Select Deployment Key",
    tableRowIDInternalName: "key",
    tableColDef: [
      { headerName: 'Deployment Name ', width: '30%', internalName: 'DeploymentName', sort: true, type: "" },
      { headerName: 'Creation Date', width: '30%', internalName: 'creationDate', sort: true, type: "" },
    ],
    enabledSearch: false,
    enabledRadioBtn: true,
    radioBtnColumnHeader: "Select",
    enabledPagination: false,
    enabledAutoScrolled: true,
    pTableStyle: {
      tableOverflowY: true,
      overflowContentHeight: '432px'
    }
  };

}
