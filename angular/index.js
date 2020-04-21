export * from "./foldingcell.module";



// Object.defineProperty(exports, "__esModule", { value: true });

// var core_1 = require("@angular/core");
// var element_registry_1 = require("nativescript-angular/element-registry");

// var templated_items_comp_1 = require("@nativescript/angular/directives/templated-items-comp");

// var ListViewComponent = /** @class */ (function(_super) {
//     __extends(ListViewComponent, _super);

//     function ListViewComponent(_elementRef, _iterableDiffers) {
//         return _super.call(this, _elementRef, _iterableDiffers) || this;
//     }
//     ListViewComponent_1 = ListViewComponent;
//     Object.defineProperty(ListViewComponent.prototype, "nativeElement", {
//         get: function() {
//             return this.templatedItemsView;
//         },
//         enumerable: true,
//         configurable: true
//     });
//     var ListViewComponent_1;
//     ListViewComponent = ListViewComponent_1 = __decorate([
//         core_1.Component({
//             selector: "FoldingListView",
//             template: "\n        <DetachedContainer>\n            <Placeholder #loader></Placeholder>\n        </DetachedContainer>",
//             changeDetection: core_1.ChangeDetectionStrategy.OnPush,
//             providers: [{ provide: templated_items_comp_1.TEMPLATED_ITEMS_COMPONENT, useExisting: core_1.forwardRef(function() { return ListViewComponent_1; }) }]
//         }),
//         __metadata("design:paramtypes", [core_1.ElementRef,
//             core_1.IterableDiffers
//         ])
//     ], ListViewComponent);
//     return ListViewComponent;
// }(templated_items_comp_1.TemplatedItemsComponent));
// exports.ListViewComponent = ListViewComponent;

// var FoldingListViewModule = /** @class */ (function() {
//     function FoldingListViewModule() {}
//     FoldingListViewModule = __decorate([
//         core_1.NgModule({
//             declarations: [
//                 ListViewComponent
//             ],
//             exports: [
//                 ListViewComponent
//             ],
//             schemas: [core_1.NO_ERRORS_SCHEMA]
//         })
//     ], FoldingListViewModule);
//     return FoldingListViewModule;
// }());
// exports.FoldingListViewModule = FoldingListViewModule;

// element_registry_1.registerElement("FoldingListView", () => require("nativescript-foldingcell").FoldingListView);

// import { Directive } from "@angular/core"; // TODO: check require .Directive without hacks

// @Directive({
//     selector: "FoldingCell"
// })
// export class FoldingCellDirective { }


// @Directive({
//     selector: "FoldingCellItem"
// })
// export class FoldingCellItemDirective { }

// export const DIRECTIVES = [FoldingCellDirective, FoldingCellItemDirective];