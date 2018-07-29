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
let Draggable = class Draggable {
    constructor(element) {
        this.element = element;
        this.topStart = 0;
        this.leftStart = 0;
        this._allowDrag = true;
    }
    ngOnInit() {
        // css changes
        if (this._allowDrag) {
            this.element.nativeElement.style.position = 'relative';
            this.element.nativeElement.className += ' cursor-draggable';
        }
    }
    onMouseDown(event) {
        if (event.button === 2)
            return; // prevents right click drag, remove his if you don't want it
        this.md = true;
        this.topStart = event.clientY - this.element.nativeElement.style.top.replace('px', '');
        this.leftStart = event.clientX - this.element.nativeElement.style.left.replace('px', '');
    }
    onMouseUp(event) {
        this.md = false;
    }
    onMouseMove(event) {
        if (this.md && this._allowDrag) {
            this.element.nativeElement.style.top = (event.clientY - this.topStart) + 'px';
            this.element.nativeElement.style.left = (event.clientX - this.leftStart) + 'px';
        }
    }
    onTouchStart(event) {
        this.md = true;
        this.topStart = event.changedTouches[0].clientY - this.element.nativeElement.style.top.replace('px', '');
        this.leftStart = event.changedTouches[0].clientX - this.element.nativeElement.style.left.replace('px', '');
        event.stopPropagation();
    }
    onTouchEnd() {
        this.md = false;
    }
    onTouchMove(event) {
        if (this.md && this._allowDrag) {
            this.element.nativeElement.style.top = (event.changedTouches[0].clientY - this.topStart) + 'px';
            this.element.nativeElement.style.left = (event.changedTouches[0].clientX - this.leftStart) + 'px';
        }
        event.stopPropagation();
    }
    set allowDrag(value) {
        this._allowDrag = value;
        if (this._allowDrag)
            this.element.nativeElement.className += ' cursor-draggable';
        else
            this.element.nativeElement.className = this.element.nativeElement.className
                .replace(' cursor-draggable', '');
    }
};
__decorate([
    core_1.HostListener('mousedown', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MouseEvent]),
    __metadata("design:returntype", void 0)
], Draggable.prototype, "onMouseDown", null);
__decorate([
    core_1.HostListener('document:mouseup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MouseEvent]),
    __metadata("design:returntype", void 0)
], Draggable.prototype, "onMouseUp", null);
__decorate([
    core_1.HostListener('document:mousemove', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MouseEvent]),
    __metadata("design:returntype", void 0)
], Draggable.prototype, "onMouseMove", null);
__decorate([
    core_1.HostListener('touchstart', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Draggable.prototype, "onTouchStart", null);
__decorate([
    core_1.HostListener('document:touchend'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Draggable.prototype, "onTouchEnd", null);
__decorate([
    core_1.HostListener('document:touchmove', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Draggable.prototype, "onTouchMove", null);
__decorate([
    core_1.Input('ng2-draggable'),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], Draggable.prototype, "allowDrag", null);
Draggable = __decorate([
    core_1.Directive({
        selector: '[ng2-draggable]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], Draggable);
exports.Draggable = Draggable;
//# sourceMappingURL=dragable-content.directive.js.map