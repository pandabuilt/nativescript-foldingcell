/// <reference path="node_modules/tns-platform-declarations/ios.d.ts" />

import { View } from '@nativescript/core/ui/core/view';
import { Color } from '@nativescript/core/ui/core/view';
import { profile } from '@nativescript/core/profiling';
import { Length } from '@nativescript/core/ui/core/view';
import { FoldingListViewBase, separatorColorProperty, backViewColorProperty, itemTemplatesProperty, ITEMTAP, LOADMOREITEMS } from "./foldingcell.common";
import { Observable, layout, PercentLength, KeyedTemplate } from "tns-core-modules/ui/page/page";
import { StackLayout } from "@nativescript/core/ui/layouts/stack-layout/stack-layout";
import { ImageSource } from "@nativescript/core/image-source/image-source";
import { Image } from "@nativescript/core/ui/image/image";
import { defaultFoldedRowHeight as DEFAULT_HEIGHT } from './foldingcell.common';
import { isEnabled, write, categories } from "@nativescript/core/trace";

export * from "./foldingcell.common";

export const infinity = layout.makeMeasureSpec(0, layout.UNSPECIFIED);

interface Constraints {
    _constraintTop?: number;
    _constraintLeft?: number;
    _constraintBottom?: number;
    _constraintRight?: number;
}

type ConstraintedView = View & Constraints;

interface FoldingCellView {
    foreground: ConstraintedView;
    container: ConstraintedView;
    index: number;
}

interface FoldingCellHeight {
    foreground: number;
    container: number;
}

export class FoldingListView extends FoldingListViewBase {

    public _ios: UITableView;
    public _map: Map<FoldingListViewCell, FoldingCellView>;
    public widthMeasureSpec: number = 0;

    private _dataSource;
    private _delegate;
    private _heights: FoldingCellHeight[];
    private _preparingCell: boolean;
    private _isDataDirty: boolean;

    public get ios(): UITableView {
        return this._ios;
    }

    public get _childrenCount(): number {
        return this._map.size;
    }

    constructor() {
        super();
        this.nativeViewProtected = this._ios = UITableView.new();
        this._ios.registerClassForCellReuseIdentifier((FoldingListViewCell as any).class(), this._defaultTemplate.key);
        this._ios.separatorColor = UIColor.clearColor;
        this._ios.rowHeight = UITableViewAutomaticDimension;
        this._ios.estimatedRowHeight = DEFAULT_HEIGHT;
        this._ios.dataSource = this._dataSource = FoldingListViewDataSource.initWithOwner(new WeakRef(this));
        this._delegate = FoldingListViewDelegate.initWithOwner(new WeakRef(this));
        this._heights = new Array<FoldingCellHeight>();
        this._map = new Map<FoldingListViewCell, FoldingCellView>();
        this.widthMeasureSpec = 0;
        this._setNativeClipToBounds();
    }

    initNativeView() {
        super.initNativeView();
    }

    disposeNativeView() {
        this._delegate = null;
        this._dataSource = null;
        super.disposeNativeView();
    }

    @profile
    onLoaded() {
        super.onLoaded();
        if (this._isDataDirty) {
            this.refresh();
        }
        this.ios.delegate = this._delegate;
    }

    onUnloaded() {
        this.ios.delegate = null;
        super.onUnloaded();
    }

    eachChildView(cb) {
        this._map.forEach((view, key) => {
            cb(view.foreground);
            cb(view.container);
        });
    }

    scrollToIndex(index: number, animated: boolean = true) {

        if (!this.ios) {
            return;
        }

        var itemsLength = this.items ? this.items.length : 0;
        if (itemsLength > 0) {
            if (index < 0) {
                index = 0;
            } else if (index >= itemsLength) {
                index = itemsLength - 1;
            }
            this.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 1, animated);
        }
        else if (isEnabled()) {
            write("Cannot scroll listview to index " + index + " when listview items not set", categories.Binding);
        }
    };

    refresh() {

        this._map.forEach((view, nativeView) => {
            if (!(view.foreground.bindingContext instanceof Observable)) {
                view.foreground.bindingContext = null;
            }
            if (!(view.container.bindingContext instanceof Observable)) {
                view.foreground.bindingContext = null;
            }
        });
        if (this.isLoaded) {
            this._ios.reloadData();
            this.requestLayout();
            this._isDataDirty = false;
        } else {
            this._isDataDirty = true;
        }
    };

    getHeight(index: number): FoldingCellHeight {
        return this._heights[index];
    };

    setHeight(index: number, value: FoldingCellHeight) {
        this._heights[index] = value;
    };

    _onFoldedRowHeightPropertyChanged(oldValue: Length, newValue: number) {

        var value = layout.toDeviceIndependentPixels(this._effectiveFoldedRowHeight);
        if (value > 0) {
            this.ios.estimatedRowHeight = value;
        }
        super._onFoldedRowHeightPropertyChanged(oldValue, newValue);
    };

    _setNativeClipToBounds() {
        this._ios.clipsToBounds = true;
    }

    _onRowHeightPropertyChanged(oldValue, newValue) {
    };

    requestLayout(): void {
        if (!this._preparingCell) {
            super.requestLayout();
        }
    };

    measure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        this.widthMeasureSpec = widthMeasureSpec;
        var changed = (this as any)._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        super.measure(widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this.ios.reloadData();
        }
    };

    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this._map.forEach((cellView, listViewCell) => {
            View.measureChild(this, cellView.foreground, (cellView.foreground as any)._currentWidthMeasureSpec, (cellView.foreground as any)._currentHeightMeasureSpec);
            View.measureChild(this, cellView.container, (cellView.container as any)._currentWidthMeasureSpec, (cellView.container as any)._currentHeightMeasureSpec);
        });
    };

    onLayout(left: number, top: number, right: number, bottom: number): void {

        super.onLayout(left, top, right, bottom);
        this._map.forEach((cellView, listViewCell) => {
            var width = layout.getMeasureSpecSize(this.widthMeasureSpec);
            var cellHeight = this.getHeight(cellView.index);
            if (cellHeight) {
                this._layoutConstraintedView(cellView.foreground, width, cellHeight.foreground);
                this._layoutConstraintedView(cellView.container, width, cellHeight.container);
            }
        });
    };

    public _prepareCell(cell: FoldingListViewCell, indexPath: NSIndexPath): FoldingCellHeight {

        var _this = this;
        var cellHeight: FoldingCellHeight;
        var isForegroundViewToBeConstrainedIn = false;
        var isContainerViewToBeConstrainedIn = false;
        var index = indexPath.row;

        try {
            this._preparingCell = true;
            var foregroundView = cell.foregroundViewTNS;
            var containerView_1 = cell.containerViewTNS;

            var containerStack;
            var foldingCellViewContainer;

            if ((!foregroundView) || (!containerView_1)) {
                containerStack = new StackLayout();

                var s1 = ImageSource.fromResourceSync('icon-60');
                var s2 = ImageSource.fromResourceSync('gallery');

                var label__1 = new Image();
                label__1.imageSource = s2;
                label__1.height = 400;

                containerStack.addChild(label__1);

                var label__2 = new Image();
                label__2.imageSource = s1;
                label__2.height = 400;

                containerStack.addChild(label__2);

                foldingCellViewContainer = containerStack;
            }

            if (!foregroundView) {
                if (foldingCellViewContainer) {
                    var i = 0;
                    foldingCellViewContainer.eachChildView(cv => {
                        if (i == 0) {
                            foregroundView = cv;
                        }
                        i++
                    })
                }
            }

            if (!containerView_1) {
                if (foldingCellViewContainer) {
                    var i = 0;
                    foldingCellViewContainer.eachChildView(cv => {
                        if (i == 1) {
                            containerView_1 = cv;
                        }
                        i++
                    })
                }
            }

            if (foldingCellViewContainer) {
                try {
                    foldingCellViewContainer.removeChildren();
                } catch (e) {
                    console.log('Cound not remove children of foldingCellViewContainer:::', foldingCellViewContainer, ":::AS:::", e)
                }
            }

            this.notify({
                eventName: FoldingListView.itemLoadingEvent,
                object: this,
                index: index,
                view: {
                    foreground: foregroundView,
                    container: containerView_1,
                },
                ios: cell,
                android: undefined,
            });
            foregroundView = this._checkAndWrapProxyContainers(foregroundView);
            containerView_1 = this._checkAndWrapProxyContainers(containerView_1);

            if (!cell.foregroundViewTNS) {
                cell.foregroundViewWeakRef = new WeakRef(foregroundView);
                isForegroundViewToBeConstrainedIn = true;
            } else if (cell.foregroundViewTNS !== foregroundView) {
                isForegroundViewToBeConstrainedIn = true;
                this._removeContainer(cell);
                cell.foregroundViewTNS.nativeViewProtected.removeFromSuperview();
                cell.foregroundViewWeakRef = new WeakRef(foregroundView);
                var _this = this;
            }

            this._prepareItem(foregroundView, index);

            if (!cell.containerViewTNS) {
                isContainerViewToBeConstrainedIn = true;
                cell.containerViewWeakRef = new WeakRef(containerView_1);
            } else if (cell.containerViewTNS !== containerView_1) {
                isContainerViewToBeConstrainedIn = true;
                this._removeContainer(cell);
                cell.containerViewTNS.nativeViewProtected.removeFromSuperview();
                cell.containerViewWeakRef = new WeakRef(containerView_1);
            }


            if (!this.detailDataLoader) {
                this._prepareItem(containerView_1, index);
            } else {
                var cachedData = this._getCachedDetailData(index);
                if (cachedData) {
                    cell._bindContainerView(index, cachedData);
                } else if (this._getIsCellExpandedIn(index)) {
                    this._getDetailDataLoaderPromise(index)
                        .then(function (result) {
                            _this._setCachedDetailData(index, result);
                            containerView_1.bindingContext = result;
                        })
                        .catch(function (e) { console.error("ERROR LOADING DETAILS:", e); });
                }
            }

            var cellView = {
                foreground: foregroundView,
                container: containerView_1,
                index: index,
            };
            this._map.set(cell, cellView);
            if (foregroundView && !foregroundView.parent) {
                this._addView(foregroundView);
            }
            if (containerView_1 && !containerView_1.parent) {
                this._addView(containerView_1);
            }
            containerView_1.marginTop = foregroundView.marginTop;
            if (isForegroundViewToBeConstrainedIn) {
                this._prepareConstrainedView(foregroundView);
            }
            if (isContainerViewToBeConstrainedIn) {
                this._prepareConstrainedView(containerView_1);
            }
            cellHeight = this._layoutCell(cellView);
            var estimatedRowHeight = layout.toDeviceIndependentPixels(cellHeight.foreground);
            if (this._ios.estimatedRowHeight !== estimatedRowHeight) {
                this._ios.estimatedRowHeight = estimatedRowHeight;
            }
            cell.resetNativeViews(cellHeight);
        } finally {
            this._preparingCell = false;
        }
        return cellHeight;
    };

    _removeContainer(cell: FoldingListViewCell): void {

        var foregroundView = cell.foregroundViewTNS;
        var containerView = cell.containerViewTNS;
        if (foregroundView.parent) {
            if (!(foregroundView.parent instanceof FoldingListView)) {
                foregroundView.parent._removeView(foregroundView);
            } else {
                this._removeView(foregroundView.parent);
            }
        }
        if (containerView.parent) {
            if (!(containerView.parent instanceof FoldingListView)) {
                containerView.parent._removeView(containerView);
            } else {
                this._removeView(containerView.parent);
            }
        }
        var preparing = this._preparingCell;
        this._preparingCell = true;
        this._preparingCell = preparing;
        this._map.delete(cell);
    };

    public [separatorColorProperty.getDefault]() {
        return this.ios.separatorColor;
    };

    public [separatorColorProperty.setNative](value: Color | UIColor) {

        this.ios.separatorColor = value instanceof Color ? value.ios : value;
    };

    public isItemAtIndexVisible(index: number): boolean {

        var indexes: NSIndexPath[] = Array.from(this.ios.indexPathsForVisibleRows);
        return indexes.some((visIndex) => { return visIndex.row === index; });
    };

    public [backViewColorProperty.getDefault](): UIColor {
        return ((FoldingListViewCell.alloc() as any).init()).backViewColor;
    };

    public [backViewColorProperty.setNative](value) {

        var actualColor = value instanceof Color ? value.ios : value;
        this._map.forEach((view, cell) => { cell.backViewColor = actualColor; });
    };

    public [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
        return null;
    };

    public [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {

        this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
        if (value) {
            for (var i = 0, length_1 = value.length; i < length_1; i++) {
                this.ios.registerClassForCellReuseIdentifier((FoldingListViewCell as any).class(), value[i].key);
            }
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.refresh();
    };

    public _measureConstraintedChild(view: ConstraintedView, measuredHeight: number) {
        return View.measureChild(this, view, this.widthMeasureSpec - (view._constraintLeft + view._constraintRight), measuredHeight);
    };

    public _layoutConstraintedView(view: ConstraintedView, width: number, height: number) {
        View.layoutChild(this, view, 0, 0, width - (view._constraintLeft + view._constraintRight), height - view._constraintTop);
    };

    public _layoutCell(cellView: FoldingCellView): FoldingCellHeight {

        if (cellView) {
            var measureForegroundSize = this._measureConstraintedChild(cellView.foreground, layout.makeMeasureSpec(this._effectiveFoldedRowHeight, layout.EXACTLY));
            var measuredContainerSize = this._measureConstraintedChild(cellView.container, infinity);
            var height = {
                foreground: measureForegroundSize.measuredHeight + cellView.foreground._constraintTop,
                container: measuredContainerSize.measuredHeight + cellView.container._constraintTop,
            };
            this.setHeight(cellView.index, height);
            return height;
        }
        return {
            foreground: this._effectiveFoldedRowHeight,
            container: this._effectiveFoldedRowHeight,
        };
    };

    _prepareConstrainedView(view: ConstraintedView) {

        view._constraintTop = PercentLength.toDevicePixels(view.marginTop);
        view._constraintLeft = PercentLength.toDevicePixels(view.marginLeft) + this.effectivePaddingLeft;
        view._constraintBottom = PercentLength.toDevicePixels(view.marginBottom);
        view._constraintRight = PercentLength.toDevicePixels(view.marginRight) + this.effectivePaddingRight;
        view.margin = "0";
    };
}


export class FoldingListViewCell extends FoldingCell {


    public foregroundViewWeakRef: WeakRef<ConstraintedView>;
    public containerViewWeakRef: WeakRef<ConstraintedView>;
    private _containerViewHeightConstraints: NSArray<NSLayoutConstraint>;

    public static initWithEmptyBackground(): FoldingListViewCell {

        var cell = <FoldingListViewCell>FoldingListViewCell.new();
        (cell as any).backgroundColor = UIColor.purpleColor;
        return cell;
    };

    public get foregroundViewTNS(): ConstraintedView {
        return this.foregroundViewWeakRef ? this.foregroundViewWeakRef.get() : null;
    }

    public get containerViewTNS(): ConstraintedView {
        return this.containerViewWeakRef ? this.containerViewWeakRef.get() : null;
    }

    public get view() {
        return (this as any).owner ? (this as any).owner.get() : null;
    }

    public initWithStyleReuseIdentifier(style, reuseIdentifier) {

        var cell = super.initWithStyleReuseIdentifier(style, reuseIdentifier);
        cell.backgroundColor = null;
        return cell;
    };

    public willMoveToSuperview(newSuperview: UIView): void {

        const parent = (this.foregroundViewTNS ? this.foregroundViewTNS.parent as FoldingListView : null);

        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    }

    public resetNativeViews(cellHeight: FoldingCellHeight) {

        for (var loop = (this as any).contentView.subviews.count - 1; loop >= 0; loop--) {
            (this as any).contentView.subviews.objectAtIndex(loop).removeFromSuperview();
        }

        this._addContainerView(cellHeight);
        this._addForegroundView(cellHeight);
        this.commonInit();
    };


    public resetContainerViewHeightContraint(newHeight: FoldingCellHeight) {

        var containerViewHeight = newHeight.container;

        var topConstraintValue = layout.toDeviceIndependentPixels(this.containerViewTNS._constraintTop);
        if (this._containerViewHeightConstraints) {
            NSLayoutConstraint.deactivateConstraints(this._containerViewHeightConstraints);
        }
        this._containerViewHeightConstraints = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (layout.toDeviceIndependentPixels(containerViewHeight) - topConstraintValue) + ")]", 0, null, { layer: this.containerView } as any);
        NSLayoutConstraint.activateConstraints(this._containerViewHeightConstraints);
    };


    public animationDurationType(itemIndex: number, type) {
        // var parent = (this.foregroundViewTNS ? this.foregroundViewTNS.parent : null);
        // return parent.foldAnimationDuration / 1000;
        return 0.33;
    };

    public _bindContainerView(index: number, dataItem: any) {

        var containerView = this.containerViewTNS;
        var parent = containerView.parent as FoldingListView;
        var width = layout.getMeasureSpecSize(parent.widthMeasureSpec);

        containerView.bindingContext = dataItem;

        var size = parent._measureConstraintedChild(containerView, infinity);
        var cellHeight = parent.getHeight(index);

        cellHeight.container = size.measuredHeight + containerView._constraintTop;
        parent.setHeight(index, cellHeight);
        if (containerView && (containerView as any).isLayoutRequired) {
            parent._layoutConstraintedView(containerView, width, cellHeight.container);
        }
        this.resetContainerViewHeightContraint(cellHeight);
    };

    public _initForegroundView(height: number) {

        var topConstraintValue = layout.toDeviceIndependentPixels(this.foregroundViewTNS._constraintTop);
        var foregroundView = (RotatedView.alloc() as any).initWithFrame(CGRectZero);
        foregroundView.translatesAutoresizingMaskIntoConstraints = false;
        foregroundView.addSubview(this.foregroundViewTNS.nativeViewProtected);
        (this as any).contentView.addSubview(foregroundView);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (layout.toDeviceIndependentPixels(height) - topConstraintValue) + ")]", 0, null, { layer: foregroundView } as any));
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + layout.toDeviceIndependentPixels(this.foregroundViewTNS._constraintLeft) + "-[layer]-" + layout.toDeviceIndependentPixels(this.foregroundViewTNS._constraintRight) + "-|", 0, null, { layer: foregroundView } as any));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: foregroundView } as any);
        NSLayoutConstraint.activateConstraints(top);
        this.foregroundView = foregroundView;
        this.foregroundViewTop = top.objectAtIndex(0);
    };

    _initContainerView(height: FoldingCellHeight) {

        var topConstraintValue = layout.toDeviceIndependentPixels(this.containerViewTNS._constraintTop);
        var containerView = UIView.alloc().initWithFrame(CGRectZero);
        containerView.translatesAutoresizingMaskIntoConstraints = false;
        containerView.addSubview(this.containerViewTNS.nativeViewProtected);
        (this as any).contentView.addSubview(containerView);
        this.containerView = containerView;
        this.resetContainerViewHeightContraint(height);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + layout.toDeviceIndependentPixels(this.containerViewTNS._constraintLeft) + "-[layer]-" + layout.toDeviceIndependentPixels(this.containerViewTNS._constraintRight) + "-|", 0, null, { layer: containerView } as any));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: containerView } as any);
        NSLayoutConstraint.activateConstraints(top);
        this.containerViewTop = top.objectAtIndex(0);
        containerView.layoutIfNeeded();
    };

    public _addForegroundView(height: FoldingCellHeight) {

        var foregroundViewHeight = height.foreground
        var topConstraintValue = layout.toDeviceIndependentPixels(10);
        var foregroundView = (RotatedView.alloc() as any).initWithFrame(CGRectZero);
        foregroundView.translatesAutoresizingMaskIntoConstraints = false;
        foregroundView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(208, 72, 30, 1)
        foregroundView.layer.cornerRadius = 2
        foregroundView.layer.borderWidth = 100;
        foregroundView.layer.borderColor = UIColor.blackColor;
        foregroundView.userInteractionEnabled = true;

        foregroundView.addSubview(this.foregroundViewTNS.nativeViewProtected);

        (this as any).contentView.addSubview(foregroundView);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (layout.toDeviceIndependentPixels(foregroundViewHeight) - topConstraintValue) + ")]", 0, null, { layer: foregroundView } as any));
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + layout.toDeviceIndependentPixels(10) + "-[layer]-" + layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: foregroundView } as any));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: foregroundView } as any);
        NSLayoutConstraint.activateConstraints(top);
        this.foregroundView = foregroundView;
        this.foregroundViewTop = top.objectAtIndex(0);
    };

    public _addContainerView(height: FoldingCellHeight) {

        var containerViewHeight = height.container
        var topConstraintValue = layout.toDeviceIndependentPixels(10);
        var containerView = UIView.alloc().initWithFrame(CGRectZero);
        containerView.translatesAutoresizingMaskIntoConstraints = false;
        containerView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(139, 65, 56, 1)
        containerView.layer.cornerRadius = 2
        containerView.layer.borderWidth = 100
        containerView.layer.borderColor = UIColor.colorWithRedGreenBlueAlpha(17, 53, 56, 1)
        containerView.userInteractionEnabled = true;
        containerView.addSubview(this.containerViewTNS.nativeViewProtected);

        (this as any).contentView.addSubview(containerView);
        this.containerView = containerView;
        this.resetContainerViewHeightContraint(height);

        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + layout.toDeviceIndependentPixels(10) + "-[layer]-" + layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: containerView } as any));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: containerView } as any);
        NSLayoutConstraint.activateConstraints(top);
        this.containerViewTop = top.objectAtIndex(0);
        containerView.layoutIfNeeded();
    };
}


@ObjCClass(UITableViewDelegate)
class FoldingListViewDelegate extends NSObject implements UITableViewDelegate {


    public static initWithOwner(owner: WeakRef<FoldingListView>): FoldingListViewDelegate {
        const delegate = FoldingListViewDelegate.new() as FoldingListViewDelegate;
        delegate._owner = owner;
        delegate._measureCellMap = new Map();
        return delegate;
    }

    private _owner: WeakRef<FoldingListView>;
    _measureCellMap;

    public tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath) {

        var owner = (this._owner as any).get();
        var cellHeight = owner.getHeight(indexPath.row);
        if (!cellHeight) {
            return layout.toDeviceIndependentPixels(owner._effectiveFoldedRowHeight);
        }
        return layout.toDeviceIndependentPixels(owner._getIsCellExpandedIn(indexPath.row) ? cellHeight.container : cellHeight.foreground);
    };

    public tableViewWillSelectRowAtIndexPath = function (tableView: UITableView, indexPath: NSIndexPath) {

        var cell = tableView.cellForRowAtIndexPath(indexPath) as FoldingListViewCell;
        var owner = this._owner.get();
        if (owner) {
            notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
        }
        return indexPath;
    };

    public tableViewDidSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath) {

        var _this = this;
        var cell = <FoldingListViewCell>tableView.cellForRowAtIndexPath(indexPath);
        var owner = (this._owner as any).get();
        if (cell.isAnimating()) {
            return;
        }
        var isExpandedIn = !(owner._getIsCellExpandedIn(indexPath.row));
        var index = indexPath.row;
        if (isExpandedIn && owner.detailDataLoader) {
            owner._getDetailDataLoaderPromise(index)
                .then((value) => {
                    cell._bindContainerView(index, value);
                    owner._setCachedDetailData(index, value);
                    setTimeout(function () { _this._performCellUnfold(cell, index, isExpandedIn); }, 1);
                })
                .catch(function (e) { console.error("ERROR LOADING DETAILS:", e); });
        } else {
            this._performCellUnfold(cell, index, isExpandedIn);
        }
        if (!isExpandedIn) {
            owner.invalidateChachedDetailData(index);
        }
    };

    public tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath) {

        var foldingCell = cell as FoldingListViewCell;
        var owner = (this._owner as any).get();
        var isExpandedIn = !!(owner._getIsCellExpandedIn(indexPath.row));
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify({
                eventName: FoldingListViewBase.loadMoreItemsEvent,
                object: owner,
            });
        }
        foldingCell.unfoldAnimatedCompletion(isExpandedIn, false, null);
    };

    public _performCellUnfold(cell: FoldingListViewCell, index: number, isExpandedIn: boolean) {

        var owner = (this._owner as any).get();
        if (owner.toggleMode && isExpandedIn) {
            var expandedIndex_1 = owner._cellExpanded.findIndex((value) => { return value; });
            var expandedCell_1;
            owner._map.forEach(function (value, key) {
                if (value.index === expandedIndex_1) {
                    expandedCell_1 = key;
                }
            });
            if (!expandedCell_1) {
                owner._setIsCellExpandedIn(expandedIndex_1, false);
            } else {
                this._performCellUnfold(expandedCell_1, expandedIndex_1, false);
            }
        }

        owner._setIsCellExpandedIn(index, isExpandedIn);
        cell.unfoldAnimatedCompletion(isExpandedIn, true, null);
        var duration = owner.foldsCount * (owner.foldAnimationDuration / 1000);
        if (isExpandedIn) {
            duration /= 2;
        }
        UIView.animateWithDurationDelayOptionsAnimationsCompletion(duration, 0, 131072, function () {
            owner.ios.beginUpdates();
            owner.ios.endUpdates();
        }, null);
    };
}

@ObjCClass(UITableViewDataSource)
class FoldingListViewDataSource extends NSObject implements UITableViewDataSource {


    public static initWithOwner(owner: WeakRef<FoldingListView>): FoldingListViewDataSource {

        const dataSource = FoldingListViewDataSource.new() as FoldingListViewDataSource;
        dataSource._owner = owner;
        return dataSource;
    }

    private _owner: WeakRef<FoldingListView>;

    public tableViewNumberOfRowsInSection(tableView: UITableView, section: number) {

        var owner = (this._owner as any).get();
        return (owner && owner.items) ? owner.items.length : 0;
    };

    public tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell {

        var owner = (this._owner as any).get();
        var cell;
        if (owner) {
            var template = owner._getItemTemplate(indexPath.row);
            cell = (tableView.dequeueReusableCellWithIdentifier(template.key) || FoldingListViewCell.initWithEmptyBackground());
            var cellHeight = owner._prepareCell(cell, indexPath);
            var width = layout.getMeasureSpecSize(owner.widthMeasureSpec);
            var foregroundView = cell.foregroundViewTNS;
            if (foregroundView && (foregroundView as any).isLayoutRequired) {
                owner._layoutConstraintedView(foregroundView, width, cellHeight.foreground);
            }
            var containerView = cell.containerViewTNS;
            if (containerView && (containerView as any).isLayoutRequired) {
                owner._layoutConstraintedView(containerView, width, cellHeight.container);
            }
            cell.itemCount = owner.foldsCount;
        } else {
            cell = FoldingListViewCell.initWithEmptyBackground();
        }
        return cell;
    };
}

export function notifyForItemAtIndex(listView, cell, view, eventName, indexPath) {

    var args = { eventName: eventName, object: listView, index: indexPath.row, view: view, ios: cell, android: undefined };
    listView.notify(args);
    return args;
}