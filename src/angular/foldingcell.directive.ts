// import { Component, Input } from "@angular/core";

// // import { Directive } from "@angular/core"; // TODO: check require .Directive without hacks

// // @Directive({
// //     selector: "FoldingCell"
// // })
// // export class FoldingCellDirective { }


// // @Directive({
// //     selector: "FoldingCellItem"
// // })
// // export class FoldingCellItemDirective { }

// // export const DIRECTIVES = [FoldingCellDirective, FoldingCellItemDirective];

// Object.defineProperty(exports, "__esModule", { value: true });
// var core_1 = require("@angular/core");
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

// console.log('LV:::', ListViewComponent)
//     // console.log('FCLV:::', fclv.FoldingListView)
// exports.ListViewComponent = ListViewComponent;




// @Component({
//     selector: "FoldingListView",
//     template: `\n        <DetachedContainer>\n            <Placeholder #loader></Placeholder>\n        </DetachedContainer>`,
//     changeDetection: ChangeDetectionStrategy.OnPush,
//     providers: [{ provide: TEMPLATED_ITEMS_COMPONENT, useExisting: forwardRef(function() { return ListViewComponent_1; }) }]
// })

// export class ListViewComponent extends TemplatedItemsComponent{




// constructor(_elementRef, _iterableDiffers)
// {
//     super(_elementRef, _iterableDiffers);
// }

// }



import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    IterableDiffers,
    NgModule,
    NO_ERRORS_SCHEMA
} from '@angular/core';

import { FoldingListView } from '../';
import {
    TEMPLATED_ITEMS_COMPONENT,
    TemplatedItemsComponent
} from './TemplatedItemsComponent';
import { registerElement } from 'nativescript-angular/element-registry';

@Component({
    selector: 'FoldingListView',
    template: `
		<DetachedContainer>
			<Placeholder #loader></Placeholder>
		</DetachedContainer>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TEMPLATED_ITEMS_COMPONENT,
            useExisting: forwardRef(() => FoldingListViewComponent)
        }
    ]
})

export class FoldingListViewComponent extends TemplatedItemsComponent {
    public get nativeElement(): FoldingListView {
        return this.templatedItemsView;
    }

    protected templatedItemsView: FoldingListView;

    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers) {
        super(_elementRef, _iterableDiffers);
    }
}

registerElement('FoldingListView', () => require('../').FoldingListView);
registerElement('ForegroundView', () => require('../').ForegroundView);
registerElement('ContainerView', () => require('../').ContainerView);