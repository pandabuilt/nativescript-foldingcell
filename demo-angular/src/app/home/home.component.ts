import { Component, OnInit } from "@angular/core";
import { registerElement } from "nativescript-angular/element-registry";
import { ListView } from "@nativescript/core/ui/list-view/list-view";
import { isAndroid } from "tns-core-modules/ui/page/page";
// import { Foldingcell } from "nativescript-foldingcell/foldingcell.android"

// registerElement("FoldingCell", () => require('nativescript-foldingcell/foldingcell.android'));

declare var UIView: any;
declare var Foldingcell: any;
declare var NSIndexPath: any;

@Component({
    selector: "Home",
    templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
    items;

    isExpanded: boolean;

    constructor() {
        // Use the component constructor to inject providers.
        this.isExpanded = false;
        this.items = [];
    }

    ngOnInit(): void {
        // Init your component properties here.
        this.items = [
            { g: 1 },
            { g: 1 },
            { g: 1 }
        ];
    }

    onLoaded(args: any) {
        //         // var fc = args.object;
        //         // console.trace('Loaed', fc)
        //         // console.trace('Loaed', fc.items)

        //         //         console.log("Tapped:::Index:::", args.index);
        //         //         console.log("Tapped:::Cell", args.ios);

        //         //         if(args.ios)
        //         // {
        //         //         console.log("Tapped:::Cell::View", args.ios.view);
        //         // }
        var flv = args.object;


        //         flv.on(flv.itemTapEvent, this.onItemTap);
        //         flv.on(flv.tapEvent, this.onTap);


        setTimeout(() => {


            // var owner = args.object.nativeViewProtected;
            // console.log("Owner:::", owner);


            // var indexPath = NSIndexPath.indexPathForRowInSection(0, 0);

            // console.log("Index:::", indexPath);

            // var cell = owner.cellForRowAtIndexPath(indexPath);
            // console.log("Cell:::", cell);

            // // var index=args.index;
            // // var cell = args.ios;
            // var isExpandedIn = !!(flv._getIsCellExpandedIn(0));

            // cell.unfoldAnimatedCompletion(!isExpandedIn, true, null)

          
            // console.log('isEXP::IN::HOME:::', isExpandedIn)

            // if (isExpandedIn == undefined || isExpandedIn == null) {
            //     cell.unfoldAnimatedCompletion(true, true, null)

            //     //  this._performCellUnfold(cell, 0, true, owner, flv);
            // } else {
            //     // this._performCellUnfold(cell, 0, isExpandedIn, owner, flv);
            //     cell.unfoldAnimatedCompletion(!isExpandedIn, true, null)
            // }

        }, 1)
        //         // setTimeout(() => {
        //         //     if (isAndroid) {
        //         //         fc.android.toggle(false);
        //         //     } else {
        //         //         console.log("Tapped:::", fc.ios)
        //         //         // try {

        //         //         //     // console.log('Class:::',  Foldingcell)
        //         //         //     // console.log('Class:::',  Foldingcell.class())

        //         //         //     // console.log('delegate:::',fc.ios)

        //         //         //     let containerViewSize = fc.ios.containerView.bounds.size
        //         //         //     let foregroundViewSize = fc.ios.foregroundView.bounds.size

        //         //         //     let containerViewHeight = fc.ios.containerView.bounds.size.height
        //         //         //     let foregroundViewSizeHeight = fc.ios.foregroundView.bounds.size.height

        //         //         //     console.log('Heights:::', containerViewHeight, foregroundViewSizeHeight, fc.ios.itemCount)

        //         //         //     fc.ios.unfoldAnimatedCompletion(!this.isExpanded, true, null);

        //         //         //     this.isExpanded = !this.isExpanded;

        //         //         //     // var duration =(owner.foldAnimationDuration / 1000);
        //         //         //     // if (isExpandedIn) {
        //         //         //     //     duration /= 2;
        //         //         //     // }
        //         //         //     UIView.animateWithDurationDelayOptionsAnimationsCompletion(0.33, 0, 131072, function () {
        //         //         //         fc.ios.beginUpdates();
        //         //         //         fc.ios.endUpdates();
        //         //         //     }, null);
        //         //         // } catch (e) {
        //         //         //     console.log('Errror::::', e)
        //         //         // }
        //         //         // fc.ios._delegate._performCellUnfold(fc.ios, 0, true)
        //         //     }
        //         // }, 2000)


        console.log('New List:::::::', args.object)
    }

    onListLoaded(args: any) {
        var list = args.object;
        // console.log('FoldingCelllist:::', list.ios);
        // var la = list.android;
        // la.setClipChildren(false);
        // la.setClipToPadding(false);
    }

    onTap(args: any) {

        console.log('Item Tapped', args.object);
        console.log('Item Tapped', args);

        // var lv = args.object;

        // lv.on(lv.itemTapEvent, (args1) => {
        //     console.log("ITEM TAPPED:::", args.index);
        //     this.onItemTap(args1);
        // });
        // if (isExpandedIn) {
        //     var expandedIndex_1 = owner._cellExpanded.findIndex(function(value) { return value; });
        //     var expandedCell_1;
        //     owner._map.forEach(function(value, key) {
        //         if (value.index === expandedIndex_1) {
        //             expandedCell_1 = key;
        //         }
        //     });
        //     if (!expandedCell_1) {
        //         owner._setIsCellExpandedIn(expandedIndex_1, false);
        //     } else {
        //         this._performCellUnfold(expandedCell_1, expandedIndex_1, false);
        //     }
        // }
        // owner._setIsCellExpandedIn(index, isExpandedIn);
        // cell.unfoldAnimatedCompletion(isExpandedIn, true, null);
        // var duration = owner.foldsCount * (owner.foldAnimationDuration / 1000);
        // if (isExpandedIn) {
        //     duration /= 2;
        // }
        // UIView.animateWithDurationDelayOptionsAnimationsCompletion(duration, 0, 131072, function() {
        //     owner.ios.beginUpdates();
        //     owner.ios.endUpdates();
        // }, null);

        // var fc = args.object;
        // if (isAndroid) {
        //     fc.android.toggle(false);
        // } else {
        //     console.log("Tapped:::", fc.ios)
        //     fc.ios._delegate._performCellUnfold(fc.ios, 0, true)
        // }
    }

    onItemTap(args) {

        console.log("Tapped:::Index:::", args.index);
        console.log("Tapped:::Cell", args.ios);

        //     if (args.ios) {
        //         console.log("Tapped:::Cell::View", args.ios.view);
        //     }

        //     var owner = args.object;
        //     var index = args.index;
        //     var cell = args.ios;
        //     var isExpandedIn = owner._getIsCellExpandedIn(index);
        //     console.log("isExpanded:::", isExpandedIn);

        //     this._performCellUnfold(cell, !isExpandedIn, index, owner, owner);
        // }

        // public _performCellUnfold(cell, index, isExpandedIn, owner,listView) {
        //     if (isExpandedIn) {
        //         var expandedIndex_1 = listView._cellExpanded.findIndex(function (
        //             value
        //         ) {
        //             return value;
        //         });
        //         var expandedCell_1;
        //         listView._map.forEach(function (value, key) {
        //             if (value.index === expandedIndex_1) {
        //                 expandedCell_1 = key;
        //             }
        //         });
        //         if (!expandedCell_1) {
        //             listView._setIsCellExpandedIn(expandedIndex_1, false);
        //         } else {
        //             this._performCellUnfold(
        //                 expandedCell_1,
        //                 expandedIndex_1,
        //                 false,
        //                 owner,
        //                 listView
        //             );
        //         }
        //     }
        //     listView._setIsCellExpandedIn(index, isExpandedIn);
        //     cell.unfoldAnimatedCompletion(isExpandedIn, true, null);
        //     var duration = listView.foldsCount * (listView.foldAnimationDuration / 1000);
        //     if (isExpandedIn) {
        //         duration /= 2;
        //     }
        //     UIView.animateWithDurationDelayOptionsAnimationsCompletion(
        //         duration,
        //         0,
        //         131072,
        //         function () {
        //             listView.ios.beginUpdates();
        //             listView.ios.endUpdates();
        //         },
        //         null
        //     );
    }
}
