import { Image } from '@nativescript/core/ui/image/image';
import { ImageSource } from '@nativescript/core/image-source/image-source';
import { KeyedTemplate } from '@nativescript/core/ui/core/view';
import { FoldingListViewBase, separatorColorProperty, itemTemplatesProperty } from './foldingcell.common';
import { Observable, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, Color, layout, PercentLength, View } from 'tns-core-modules/ui/page/page';
import { StackLayout } from "@nativescript/core/ui/layouts/stack-layout/stack-layout"

export interface MixedView {
    foreground: View;
    container: View
}

export interface FoldingCellView {
    foreground: View;
    container: View;
    index: number;
}

export var ItemClickListener;

export function initializeItemClickListener() {
    if (ItemClickListener) {
        return;
    }
    ItemClickListener = ItemClickListenerImpl;
}

@Interfaces([android.widget.AdapterView.OnItemClickListener])
export class ItemClickListenerImpl extends java.lang.Object implements android.widget.AdapterView.OnItemClickListener {

    constructor(public owner: FoldingListView) {
        super();
        return global.__native(this);
    }

    public onItemClick<T extends android.widget.Adapter>(parent: android.widget.AdapterView<T>, convertView: android.view.View, index: number, id: number) {
        var isExpandedIn = this.owner._getIsCellExpandedIn(index);
        var cell = convertView as com.ramotion.foldingcell.FoldingCell;
        var cellView = this.owner._realizedItems.get(cell);

        if (!isExpandedIn && this.owner.detailDataLoader) {
            this.owner._getDetailDataLoaderPromise(index)
                .then((result) => {
                    this.owner._setCachedDetailData(index, result);
                    cellView.container.bindingContext = result;
                    this._toggleCell(cell, index);
                })
                .catch((e) => { console.error("ERROR LOADING DETAILS:", e); });
        } else {
            this._toggleCell(cell, index);
        }
        if (!isExpandedIn) {
            this.owner.invalidateChachedDetailData(index);
        }
    }

    public _toggleCell(cell: com.ramotion.foldingcell.FoldingCell, index: number) {
        var isExpandedIn = this.owner._getIsCellExpandedIn(index);
        if (this.owner.toggleMode && !isExpandedIn) {
            var expandedIndex_1 = this.owner._cellExpanded.findIndex((value) => { return value; });
            var expandedCell_1: com.ramotion.foldingcell.FoldingCell;
            this.owner._realizedItems.forEach((cellView, currentCell) => {
                if (cellView.index === expandedIndex_1) {
                    expandedCell_1 = currentCell;
                }
            });
            if (!expandedCell_1) {
                this.owner._setIsCellExpandedIn(expandedIndex_1, false);
            } else {
                this._toggleCell(expandedCell_1, expandedIndex_1);
            }
        }
        cell.toggle(false);
        this.owner._setIsCellExpandedIn(index, !isExpandedIn);
    };

}


export class FoldingListView extends FoldingListViewBase {

    public nativeViewProtected: android.widget.ListView;
    public _realizedItems: Map<com.ramotion.foldingcell.FoldingCell, FoldingCellView>;
    public _realizedTemplates: Map<string, Map<android.view.View, MixedView>>;
    public _androidViewId: number;


    constructor() {
        super();
        this._realizedItems = new Map<com.ramotion.foldingcell.FoldingCell, FoldingCellView>();
        this._realizedTemplates = new Map<string, Map<android.view.View, MixedView>>();
        this._androidViewId = -1;
    }

    public get _childrenCount(): number {
        return this._realizedItems.size;
    }

    public createNativeView(): android.widget.ListView {
        initializeItemClickListener();
        var listView = new android.widget.ListView(this._context);
        listView.setDescendantFocusability(android.view.ViewGroup.FOCUS_AFTER_DESCENDANTS);
        listView.setCacheColorHint(android.graphics.Color.TRANSPARENT);
        listView.setDivider(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
        listView.setDividerHeight(0);
        listView.setScrollBarStyle(android.widget.ListView.SCROLLBARS_OUTSIDE_OVERLAY);
        ensureFoldingListViewAdapterClass();
        var adapter = new FoldingListViewAdapterClass(this);
        listView.setAdapter(adapter);
        (listView as any).adapter = adapter;
        var itemClickListener = new ItemClickListener(this);
        listView.setOnItemClickListener(itemClickListener);
        (listView as any).itemClickListener = itemClickListener;
        return listView;
    };
    public initNativeView() {
        super.initNativeView();
        super.updateEffectiveFoldedRowHeight();
        var nativeView = this.nativeViewProtected;
        (nativeView as any).itemClickListener.owner = this;
        var adapter = (nativeView as any).adapter;
        adapter.owner = this;
        nativeView.setAdapter(adapter);
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }
        nativeView.setId(this._androidViewId);
    };

    public disposeNativeView() {
        var nativeView = this.nativeViewProtected;
        nativeView.setAdapter(null);
        (nativeView as any).itemClickListener.owner = null;
        (nativeView as any).adapter.owner = null;
        this.clearRealizedCells();
        super.disposeNativeView();
    };

    public onLoaded() {
        super.onLoaded();
        this.requestLayout();
    };


    public refresh() {
        var nativeView = this.nativeViewProtected;
        if (!nativeView || !nativeView.getAdapter()) {
            return;
        }
        var clearBindingContext = (view) => {
            if (!(view.bindingContext instanceof Observable)) {
                view.bindingContext = null;
            }
        };
        this._realizedItems.forEach((view, cell) => {
            clearBindingContext(view);
        });
        (nativeView.getAdapter() as android.widget.BaseAdapter).notifyDataSetChanged();
    };


    public scrollToIndex(index: number, animated: boolean = true) {
        var nativeView = this.nativeViewProtected;
        if (nativeView) {
            if (animated) {
                nativeView.smoothScrollToPosition(index);
            } else {
                nativeView.setSelection(index);
            }
        }
    };

    public eachChildView(callback: (child: View) => boolean): void {
        var performCallback = (view) => {
            if (view.parent instanceof FoldingListView) {
                callback(view);
            } else {
                if (view.parent) {
                    callback(view.parent);
                }
            }
        };
        this._realizedItems.forEach((view, cell) => {
            performCallback(view);
        });
    };

    public isItemAtIndexVisible(index: number): boolean {
        var nativeView = this.nativeViewProtected;
        var start = nativeView.getFirstVisiblePosition();
        var end = nativeView.getLastVisiblePosition();
        return (index >= start && index <= end);
    };

    public [paddingTopProperty.getDefault](): number {
        return this.nativeView.getPaddingTop();
    };

    public [paddingTopProperty.setNative](value: PercentLength) {
        this._setPadding({ top: this.effectivePaddingTop });
    };

    public [paddingRightProperty.getDefault](): number {
        return this.nativeView.getPaddingRight();
    };

    public [paddingRightProperty.setNative](value: PercentLength) {
        this._setPadding({ right: this.effectivePaddingRight });
    };

    public [paddingBottomProperty.getDefault](): number {
        return this.nativeView.getPaddingBottom();
    };

    public [paddingBottomProperty.setNative](value: PercentLength) {
        this._setPadding({ bottom: this.effectivePaddingBottom });
    };

    public [paddingLeftProperty.getDefault](): number {
        return this.nativeView.getPaddingLeft();
    };

    public [paddingLeftProperty.setNative](value: PercentLength): void {
        this._setPadding({ left: this.effectivePaddingLeft });
    };

    public [separatorColorProperty.getDefault]() {
        var nativeView = this.nativeViewProtected;
        return {
            dividerHeight: nativeView.getDividerHeight(),
            divider: nativeView.getDivider()
        };
    };

    public [separatorColorProperty.setNative](value: any): void {
        var nativeView = this.nativeViewProtected;
        if (value instanceof Color) {
            nativeView.setDivider(new android.graphics.drawable.ColorDrawable(value.android));
            nativeView.setDividerHeight(1);
        } else {
            nativeView.setDivider(value.divider);
            nativeView.setDividerHeight(value.dividerHeight);
        }
    };

    public [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
        return null;
    };

    public [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
        this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
        if (value) {
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.nativeViewProtected.setAdapter(new FoldingListViewAdapterClass(this));
        this.refresh();
    };

    public clearRealizedCells(): void {
        var _this = this;
        var removeView = (view) => {
            if (view.parent) {
                if (!(view.parent instanceof FoldingListView)) {
                    _this._removeView(view.parent);
                }
                view.parent._removeView(view);
            }
        };
        this._realizedItems.forEach((view, nativeView) => {
            removeView(view);
        });
        this._realizedItems.clear();
        this._realizedTemplates.clear();
    };

    public _setPadding(newPadding: { top?: number, right?: number, bottom?: number, left?: number }) {
        var nativeView = this.nativeView;
        var padding = {
            top: nativeView.getPaddingTop(),
            right: nativeView.getPaddingRight(),
            bottom: nativeView.getPaddingBottom(),
            left: nativeView.getPaddingLeft()
        };
        var newValue = Object.assign(padding, newPadding);
        nativeView.setPadding(newValue.left, newValue.top, newValue.right, newValue.bottom);
    };

}

var FoldingListViewAdapterClass;

export function ensureFoldingListViewAdapterClass() {
    if (FoldingListViewAdapterClass) {
        return;
    }

    FoldingListViewAdapterClass = FoldingListViewAdapter;
}

export class FoldingListViewAdapter extends android.widget.BaseAdapter {

    constructor(public owner: FoldingListView) {
        super();
        this.owner = owner
        return global.__native(this);
    }

    public getCount() {
        return this.owner && this.owner.items && this.owner.items.length ? this.owner.items.length : 0;
    };

    public getItem(i: number) {
        if (this.owner && this.owner.items && i < this.owner.items.length) {
            return this.owner._getDataItem(i);
        }
        return null;
    };

    public getItemId(i: number) {
        return long(i);
    };

    public hasStableIds(): boolean {
        return true;
    };

    public getViewTypeCount(): number {
        return this.owner._itemTemplatesInternal.length;
    };

    public getItemViewType(index: number) {
        var template = this.owner._getItemTemplate(index);
        return this.owner._itemTemplatesInternal.indexOf(template);
    };

    public getView(index: number, convertView: android.view.View, parent: android.view.ViewGroup) {

        if (!this.owner) {
            return null;
        }

        var totalItemCount = this.owner.items ? this.owner.items.length : 0;
        if (index === (totalItemCount - 1)) {
            this.owner.notify({
                eventName: FoldingListViewBase.loadMoreItemsEvent,
                object: this.owner,
            });
        }

        var owner = this.owner;
        var template = owner._getItemTemplate(index);
        var view;
        var foregroundView;
        var containerView;
        var cell = <com.ramotion.foldingcell.FoldingCell>convertView;
        var isCellExpandedIn = owner._getIsCellExpandedIn(index);

        if (cell) {
            view = owner._realizedTemplates.get(template.key).get(cell);
            if (!view) {
                throw new Error("There is no entry with key '" + cell + "' in the realized views cache for template with key'" + template.key + "'.");
            }
        } else {
            view = owner._checkAndWrapProxyContainers(template.createView());
        }

        if (!view) {

            view = new StackLayout();

            var s1 = ImageSource.fromResourceSync('logo');
            var s2 = ImageSource.fromResourceSync('icon');

            var label__1 = new Image();
            label__1.stretch = "fill"
            label__1.imageSource = s2;
            label__1.height = 400;

            view.addChild(label__1);

            var label__2 = new Image();
            label__2.imageSource = s1;
            label__2.height = 400;

            view.addChild(label__2);
        }

        if (view) {
            var i = 0;
            if (view.eachChildView) {
                view.eachChildView(cv => {
                    if (i == 0) {
                        foregroundView = cv;
                    } else if (i == 1) {
                        containerView = cv;
                    }
                    i++;
                })
            }
        }

        if (view) {
            if (view.getChildrenCount)
                if (view.getChildrenCount() > 0) {
                    if (view.removeChildren) {
                        view.removeChildren();
                    }
                }
        }

        owner._addView(containerView);
        owner._addView(foregroundView);

        var context = owner._context;
        var MATCH_PARENT = android.view.ViewGroup.LayoutParams.MATCH_PARENT;
        var WRAP_CONTENT = android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
        cell = new com.ramotion.foldingcell.FoldingCell(context);
        org.nativescript.widgets.ViewHelper.setWidth(cell, MATCH_PARENT);
        org.nativescript.widgets.ViewHelper.setHeight(cell, WRAP_CONTENT);
        var container = new android.widget.FrameLayout(context);
        org.nativescript.widgets.ViewHelper.setWidth(container, MATCH_PARENT);
        org.nativescript.widgets.ViewHelper.setHeight(container, WRAP_CONTENT);
        container.addView(containerView.android);
        cell.addView(container);
        var foreground = new android.widget.FrameLayout(context);
        org.nativescript.widgets.ViewHelper.setWidth(foreground, MATCH_PARENT);
        org.nativescript.widgets.ViewHelper.setHeight(foreground, WRAP_CONTENT);
        foreground.addView(foregroundView.android);
        cell.addView(foreground);

        owner.notify({
            eventName: FoldingListViewBase.itemLoadingEvent,
            object: owner,
            index: index,
            view: {
                foreground: foregroundView,
                container: containerView,
            },
            android: parent,
            ios: undefined,
        });

        cell.initialize(owner.foldsCount * owner.foldAnimationDuration, owner.backViewColor.android, 0);
        foregroundView.height = layout.toDeviceIndependentPixels(owner._effectiveFoldedRowHeight);
        foregroundView.marginBottom = 0;
        owner._prepareItem(foregroundView, index);
        if (!owner.detailDataLoader) {
            owner._prepareItem(containerView, index);
        } else {
            var cachedData = owner._getCachedDetailData(index);
            if (cachedData) {
                containerView.bindingContext = cachedData;
            } else if (isCellExpandedIn) {
                owner._getDetailDataLoaderPromise(index)
                    .then(function (result) {
                        owner._setCachedDetailData(index, result);
                        containerView.bindingContext = result;
                    })
                    .catch(function (e) { console.error("ERROR LOADING DETAILS:", e); });
            }
        }

        var realizedItemsForTemplateKey = owner._realizedTemplates.get(template.key);

        if (!realizedItemsForTemplateKey) {
            realizedItemsForTemplateKey = new Map<android.view.View, MixedView>();
            owner._realizedTemplates.set(template.key, realizedItemsForTemplateKey);
        }
        realizedItemsForTemplateKey.set(cell, { foreground: foregroundView, container: containerView });
        owner._realizedItems.set(cell, { foreground: foregroundView, container: containerView, index: index });

        if (!isCellExpandedIn) {
            org.nativescript.widgets.ViewHelper.setHeight(cell, PercentLength.toDevicePixels(foregroundView.height) +
                PercentLength.toDevicePixels(foregroundView.marginTop) +
                PercentLength.toDevicePixels(foregroundView.borderTopWidth) +
                PercentLength.toDevicePixels(foregroundView.borderBottomWidth));
        }
        setTimeout(() => {
            if (isCellExpandedIn) {
                cell.unfold(true);
            } else {
                cell.getChildAt(0).setVisibility(android.view.View.GONE);
                cell.fold(true);
            }
        }, 1);
        return cell;
    };

}
