import { BrowserModule } from '@angular/platform-browser';
import { NgModule, enableProdMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PTableComponent } from './shared/components/p-table/p-table.component';
import { MakeDraggable, MakeDroppable, Draggable } from './shared/components/drag-drop-service/drag.n.drop';

import { AngularFireModule } from 'angularfire2'
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

import { HttpModule } from '@angular/http'
import { AppComponent } from './app.component';
import { AuthService } from './providers/auth.service'
import { RouterModule, Routes } from '@angular/router'
import { HomePageComponent } from './home-page/home-page.component'
import { LoginComponent } from './login/login.component';
import { HomeTabComponent } from './tabs/home-tab/home-tab.component';
import { MessageHistoryTabComponent } from './tabs/message-history-tab/message-history-tab.component';
import { StatusTabComponent } from './tabs/status-tab/status-tab.component';
import { StickyMessageTabComponent } from './tabs/sticky-message-tab/sticky-message-tab.component';
import { GroupsTabComponent } from './tabs/groups-tab/groups-tab.component';
import { MessageTemplateTabComponent } from './tabs/message-template-tab/message-template-tab.component';
import { MapsTabComponent } from './tabs/maps-tab/maps-tab.component'
import { SettingsTabComponent } from './tabs/settings-tab/settings-tab.component'
import { firebaseConfig } from './config'
import { LiveFeedComponent } from './tabs/live-feed/live-feed.component';

import { FilterOutValueFromArrayPipe } from './tabs/message-template-tab/message-template-dropdown-pipe';

import { FirebaseDb } from "./shared/model/constants"
import { AgmCoreModule } from '@agm/core';
// import { AlertComponent } from './shared/components/alert/alert.component';
// import { AlertService } from './shared/components/alert/alert.service';
import { AlertModule } from './shared/components/alert/alert.module';


const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    LoginComponent,
    HomeTabComponent,
    MessageHistoryTabComponent,
    StatusTabComponent,
    StickyMessageTabComponent,
    GroupsTabComponent,
    MessageTemplateTabComponent,
    MapsTabComponent,
    SettingsTabComponent,
    PTableComponent,
    MakeDraggable,
    MakeDroppable,
    Draggable,
    LiveFeedComponent,
    FilterOutValueFromArrayPipe,    
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AlertModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCl6aWj8VcB2D-T6UkFGDhc4AaiyxP0JwQ'
    }),
    RouterModule.forRoot(routes)
  ],
  providers: [AuthService,FirebaseDb],
  exports:[AlertModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){
    console.debug(firebaseConfig.authDomain);
  }
 }
