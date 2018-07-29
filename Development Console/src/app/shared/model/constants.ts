export enum TabEnum{
    Home,
    MessageHistory,
    Status,
    StickyMessage,
    Groups,
    MessageTemplates,
    Maps,
    Settings
  }

  export  class FirebaseDb{    
    static deploymentKey:string="";
    static accountType:string;
    static rootOfDeployment:string=JSON.parse(localStorage.getItem('wearbolsConsoleLogin'))==null?null:"Deployments/"+JSON.parse(localStorage.getItem('wearbolsConsoleLogin')).deploymentKey;
    static firebaseDeploymentAdminTable:string="DeploymentAdmins";
    static firebaseGroupTable: string ="Groups";
    static firebaseUserListTable: string = "Users";
    static firebaseSettingsTable: string = "Settings";
    static firebaseWatchInformationTable:string="Watches";
    static firebaseMessageHistoryTable:string="MessageHistoryList";
    
    static firebaseStickyNoteTable:string="StickyNotes";
    static firebasePartialMessageListTable: string ="PartialMessageList";
    static firebaseConsoleUserListTable: string = "DeploymentAdmins";
    static firebaseMultipartMessageListTable: string = "MessageTemplates";
    static firebaseMessageTemplateTable:string="MessageTemplates";    

    public fnListNameWithRoot(listName:string):string{
      let rootOfDeploymentKey:string=JSON.parse(localStorage.getItem('wearbolsConsoleLogin'))==null?null:"Deployments/"+JSON.parse(localStorage.getItem('wearbolsConsoleLogin')).deploymentKey;
      return rootOfDeploymentKey+ "/"+listName;
    }
  }
    
