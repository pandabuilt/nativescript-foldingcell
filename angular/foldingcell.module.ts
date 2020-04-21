// import { FoldingCell } from './../foldingcell.android';

// Object.defineProperty(exports, "__esModule", { value: true });
// var core_1 = require("@angular/core");
// var directives_1 = require("nativescript-foldingcell/angular/foldingcell.directive");
// var element_registry_1 = require("nativescript-angular/element-registry");

// // element_registry_1.registerElement("FoldingListView", function() { return fclv.FoldingListView; });

// var FoldingListViewModule = /** @class */ (function() {
//     function FoldingListViewModule() {}
//     FoldingListViewModule = __decorate([
//         core_1.NgModule({
//             declarations: [
//                 directives_1.ListViewComponent
//             ],
//             exports: [
//                 directives_1.ListViewComponent
//             ],
//             schemas: [core_1.NO_ERRORS_SCHEMA]
//         })
//     ], FoldingListViewModule);
//     return FoldingListViewModule;
// }());
// exports.FoldingListViewModule = FoldingListViewModule;

// element_registry_1.registerElement("FoldingListView", () => require("nativescript-foldingcell").FoldingListView);





// import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
// import { registerElement } from "nativescript-angular/element-registry";

// import { ListViewComponent } from "./foldingcell.directive"

// @NgModule({
//     declarations: [ListViewComponent],
//     exports: [ListViewComponent],
//     schemas: [NO_ERRORS_SCHEMA]

// })
// export class FoldingListViewModule {}

// registerElement("FoldingListView", () => require("../").FoldingListView);
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { FoldingListViewComponent } from './foldingcell.directive';
import { CommonModule } from '@angular/common';


@NgModule({
    declarations: [FoldingListViewComponent],
    imports: [CommonModule],
    exports: [FoldingListViewComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class FoldingListViewModule {
}