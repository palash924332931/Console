"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const core_1 = require("@angular/core");
let PTableFilterComponent = class PTableFilterComponent {
    transform(ary, args) {
        // let filter = args[0].toLocaleLowerCase();
        //return filter ? value.filter(movie=> movie.title.toLocaleLowerCase().indexOf(filter) != -1) : value;
        let execution = false;
        if (args) {
            let filterKeys = Object.keys(ary[0]);
            return ary.filter(function (item, index, array) {
                let returnVal = false;
                for (let i = 0; i < filterKeys.length; i++) {
                    if (item[filterKeys[i]].toLowerCase().includes(args.toLowerCase())) {
                        returnVal = true;
                    }
                }
                return returnVal;
            });
        }
        else {
            return ary;
        }
    }
};
PTableFilterComponent = __decorate([
    core_1.Pipe({
        name: 'ptablefilter'
    })
], PTableFilterComponent);
exports.PTableFilterComponent = PTableFilterComponent;
//# sourceMappingURL=p-table-pipe.js.map