import { ElementRef, IterableDiffers } from "@angular/core";
import { TemplatedItemsComponent } from "@nativescript/angular/directives/templated-items-comp";
import { FoldingListView } from "../";
export declare class FoldingListViewComponent extends TemplatedItemsComponent {
    readonly nativeElement: FoldingListView;
    protected templatedItemsView: FoldingListView;
    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers);
}

export declare class FoldingListViewModule {
}