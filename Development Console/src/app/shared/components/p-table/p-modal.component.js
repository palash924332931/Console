"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require("@angular/core");
let PModalComponent = class PModalComponent {
    // @Input() public modalSaveFnParam: string;
    // @Input() public saveBtnVisibility: boolean;
    // @Input() public btnCaption: string="";
    constructor() {
        this.fnActionOnSaveBtn = new core_1.EventEmitter();
        // alert(this.modalSettingOption["modalTitle"]);
        console.log("input info: " + JSON.stringify(this.modalSettingOption));
    }
    fnSaveModalInfo() {
        alert(this.modalSettingOption);
        console.log("input info: " + JSON.stringify(this.modalSettingOption));
        this.fnActionOnSaveBtn.emit('');
    }
};
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], PModalComponent.prototype, "fnActionOnSaveBtn", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], PModalComponent.prototype, "modalSettingOption", void 0);
PModalComponent = __decorate([
    core_1.Component({
        selector: 'app-p-modal',
        template: `<div class="modal fade packSearchModalWrapperSave" id="customModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="false">
    <div class="modal-dialogSave">
        <div class="modal-content packSearchModalPanel filPSMod">
            <div class = "modal-header">
            <button type = "button" class = "close" data-dismiss = "modal" aria-hidden = "true">
                  &times;
            </button>           
            <h4 class = "modal-title custom-modal-title" id = "customModalTitle">
              {{modalSettingOption.modalTitle}}
            </h4>
         </div>
         <div class = "modal-body">
            <div class="row">
                <ng-content></ng-content>
                    <div class="col-sm-12"><div class="col-sm-12 filHeadingMod"><span class=""> </span></div></div> 
            </div>
         </div>

          <div class = "modal-footer">
            <button type = "button" class = "btn btn-default" data-dismiss = "modal">
               Close
            </button>
            <button type="button" class="btn btn-default pull-right" id="saveNextBtnAction" (click)="fnSaveModalInfo()" >{{modalSettingOption.modalSaveBtnCaption}}</button>
         </div>         
        </div>
    </div>
</div>`
    }),
    __metadata("design:paramtypes", [])
], PModalComponent);
exports.PModalComponent = PModalComponent;
//# sourceMappingURL=p-modal.component.js.map