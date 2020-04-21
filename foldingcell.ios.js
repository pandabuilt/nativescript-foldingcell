"use strict";

function __export(m) {
    for (var p in m)
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var folding_list_view_common_1 = require("./foldingcell.common");
var stack_layout_1 = require("@nativescript/core/ui/layouts/stack-layout");
var proxy_view_container_1 = require("@nativescript/core/ui/proxy-view-container");
var profiling_1 = require("@nativescript/core/profiling");
var trace = require("@nativescript/core/trace");

var label_1 = require("@nativescript/core/ui/label/label");
var image_1 = require("@nativescript/core/ui/image/image");
var image_source_1 = require("@nativescript/core/image-source/image-source");
var observable_1 = require("@nativescript/core/data/observable");
var view_1 = require("@nativescript/core/ui/core/view");
var utils = require("@nativescript/core/utils/utils");



var ITEMLOADING = folding_list_view_common_1.FoldingListViewBase.itemLoadingEvent;
var LOADMOREITEMS = folding_list_view_common_1.FoldingListViewBase.loadMoreItemsEvent;
var ITEMTAP = folding_list_view_common_1.FoldingListViewBase.itemTapEvent;
var DEFAULT_HEIGHT = 44;
var infinity = folding_list_view_common_1.layout.makeMeasureSpec(0, folding_list_view_common_1.layout.UNSPECIFIED);
__export(require("./foldingcell.common"));


var FoldingListView = (function(_super) {
    __extends(FoldingListView, _super);

    function FoldingListView() {
        var _this = _super.call(this) || this;


        _this.nativeViewProtected = _this._ios = UITableView.new();
        _this._ios.registerClassForCellReuseIdentifier(FoldingListViewCell.class(), _this._defaultTemplate.key);
        _this._ios.separatorColor = utils.ios.getter(UIColor, UIColor.clearColor);
        _this._ios.rowHeight = UITableViewAutomaticDimension;
        _this._ios.estimatedRowHeight = DEFAULT_HEIGHT;
        _this._ios.dataSource = _this._dataSource = FoldingListViewDataSource.initWithOwner(new WeakRef(_this));
        _this._delegate = FoldingListViewDelegate.initWithOwner(new WeakRef(_this));
        _this._heights = new Array();
        _this._map = new Map();
        _this.widthMeasureSpec = 0;
        _this._setNativeClipToBounds();

        return _this;
    }
    FoldingListView.prototype.initNativeView = function() {
        _super.prototype.initNativeView.call(this);
    };
    FoldingListView.prototype.disposeNativeView = function() {
        this._delegate = null;
        this._dataSource = null;
        _super.prototype.disposeNativeView.call(this);
    };
    FoldingListView.prototype._setNativeClipToBounds = function() {
        this._ios.clipsToBounds = true;
    };
    FoldingListView.prototype.onLoaded = function() {
        _super.prototype.onLoaded.call(this);
        if (this._isDataDirty) {
            this.refresh();
        }
        this.ios.delegate = this._delegate;
    };
    FoldingListView.prototype.onUnloaded = function() {
        this.ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(FoldingListView.prototype, "ios", {
        get: function() {
            return this.nativeViewProtected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FoldingListView.prototype, "_childrenCount", {
        get: function() {
            return this._map.size;
        },
        enumerable: true,
        configurable: true
    });

    FoldingListView.prototype.eachChildView = function(callback) {
        this._map.forEach(function(view, key) {
            callback(view.foreground);
            callback(view.container);
        });
    };
    FoldingListView.prototype.scrollToIndex = function(index, animated) {
        if (animated === void 0) { animated = true; }
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
        } else if (trace.isEnabled()) {
            trace.write("Cannot scroll listview to index " + index + " when listview items not set", trace.categories.Binding);
        }
    };
    FoldingListView.prototype.refresh = function() {
        this._map.forEach(function(view, nativeView) {
            if (!(view.foreground.bindingContext instanceof folding_list_view_common_1.Observable)) {
                view.foreground.bindingContext = null;
            }
            if (!(view.container.bindingContext instanceof folding_list_view_common_1.Observable)) {
                view.foreground.bindingContext = null;
            }
        });
        if (this.isLoaded) {
            this.ios.reloadData();
            this.requestLayout();
            this._isDataDirty = false;
        } else {
            this._isDataDirty = true;
        }
    };
    FoldingListView.prototype.getHeight = function(index) {
        return this._heights[index];
    };
    FoldingListView.prototype.setHeight = function(index, value) {
        this._heights[index] = value;
    };
    FoldingListView.prototype._onFoldedRowHeightPropertyChanged = function(oldValue, newValue) {
        var value = view_1.layout.toDeviceIndependentPixels(this._effectiveFoldedRowHeight);
        if (value > 0) {
            this.ios.estimatedRowHeight = value;
        }
        _super.prototype._onFoldedRowHeightPropertyChanged.call(this, oldValue, newValue);
    };
    FoldingListView.prototype._onRowHeightPropertyChanged = function(oldValue, newValue) {
        var value = folding_list_view_common_1.layout.toDeviceIndependentPixels(this._effectiveRowHeight);
        var nativeView = this.ios;
        if (value < 0) {
            nativeView.rowHeight = UITableViewAutomaticDimension;
            nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
            this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
        } else {
            nativeView.rowHeight = value;
            nativeView.estimatedRowHeight = value;
            this._delegate = UITableViewRowHeightDelegateImpl.initWithOwner(new WeakRef(this));
        }
        if (this.isLoaded) {
            nativeView.delegate = this._delegate;
        }
        _super.prototype._onRowHeightPropertyChanged.call(this, oldValue, newValue);
    };

    FoldingListView.prototype.requestLayout = function() {
        if (!this._preparingCell) {
            _super.prototype.requestLayout.call(this);
        }
    };
    FoldingListView.prototype.measure = function(widthMeasureSpec, heightMeasureSpec) {
        this.widthMeasureSpec = widthMeasureSpec;
        var changed = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        _super.prototype.measure.call(this, widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this.ios.reloadData();
        }
    };
    FoldingListView.prototype.onMeasure = function(widthMeasureSpec, heightMeasureSpec) {
        var _this = this;
        _super.prototype.onMeasure.call(this, widthMeasureSpec, heightMeasureSpec);
        this._map.forEach(function(cellView, listViewCell) {
            folding_list_view_common_1.View.measureChild(_this, cellView.foreground, cellView.foreground._currentWidthMeasureSpec, cellView.foreground._currentHeightMeasureSpec);
            folding_list_view_common_1.View.measureChild(_this, cellView.container, cellView.container._currentWidthMeasureSpec, cellView.container._currentHeightMeasureSpec);
        });
    };
    FoldingListView.prototype.onLayout = function(left, top, right, bottom) {
        var _this = this;
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        this._map.forEach(function(cellView, listViewCell) {
            var width = view_1.layout.getMeasureSpecSize(_this.widthMeasureSpec);
            var cellHeight = _this.getHeight(cellView.index);
            if (cellHeight) {
                _this._layoutConstraintedView(cellView.foreground, width, cellHeight.foreground);
                _this._layoutConstraintedView(cellView.container, width, cellHeight.container);
            }
        });
    };
    FoldingListView.prototype._prepareCell = function(cell, indexPath) {
        var _this = this;
        var cellHeight;
        var isForegroundViewToBeConstrainedIn = false;
        var isContainerViewToBeConstrainedIn = false;
        var index = indexPath.row;
        try {
            this._preparingCell = true;
            var foregroundView = cell.foregroundViewTNS;
            var containerView_1 = cell.containerViewTNS;
            console.log('Temp:::', this._getItemTemplate(index), "Index:::", index, "Hasfun::", this.itemTemplate)
                // var foldingCellViewContainer = this._getItemTemplate(index).createView() || this._getDefaultItemContent(index);
            var containerStack;
            var foldingCellViewContainer;

            if ((!foregroundView) || (!containerView_1)) {
                containerStack = new stack_layout_1.StackLayout();
                // var label__1 = new label_1.Label();
                // label__1.backgroundColor = "pink";
                // label__1.text = "Fore"
                // label__1.height = 400;

                // containerStack.addChild(label__1);


                // var label__2 = new label_1.Label();
                // label__2.backgroundColor = "orange";
                // label__2.text = "back"
                // label__2.height = 400;

                // containerStack.addChild(label__2);

                var s1 = image_source_1.ImageSource.fromResourceSync('icon-60');
                var s2 = image_source_1.ImageSource.fromResourceSync('gallery');

                var label__1 = new image_1.Image();
                label__1.imageSource = s2;
                label__1.height = 400;

                containerStack.addChild(label__1);


                var label__2 = new image_1.Image();
                label__2.imageSource = s1;
                label__2.height = 400;

                containerStack.addChild(label__2);

                foldingCellViewContainer = containerStack;
            }


            // if (foldingCellViewContainer) {
            //     foldingCellViewContainer.eachChildView(cv => {
            //         console.log('ContainerChild:::', cv)
            //         console.log('ContainerChild:::', cv instanceof ForegroundView_1)
            //         console.log('ContainerChild:::', cv instanceof ContainerView_1)
            //     })
            // }

            if (!foregroundView) {
                if (foldingCellViewContainer) {
                    var i = 0;
                    foldingCellViewContainer.eachChildView(cv => {
                        // if (cv instanceof ForegroundView_1) {
                        if (i == 0) {
                            foregroundView = cv;
                        }
                        i++
                        // }
                    })
                }
            }

            if (!containerView_1) {
                if (foldingCellViewContainer) {
                    var i = 0;
                    foldingCellViewContainer.eachChildView(cv => {
                        // if (cv instanceof ContainerView_1) {
                        if (i == 1) {
                            containerView_1 = cv;
                        }
                        i++
                        // }
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

            // if (!foregroundView) {
            //     foregroundView = this._getForegroundItemTemplate(index).createView();
            // }

            // if (!containerView_1) {
            //     containerView_1 = this._getContainerItemTemplate(index).createView();
            // }
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

            console.log('Cell:::', cell)
            console.log('Cell:::', cell.foregroundViewWeakRef)
            console.log('Cell:::', cell.containerViewWeakRef)
            console.log('Cell:::', cell.foregroundViewTNS)
            console.log('Cell:::', cell.containerViewTNS)
            console.log('FVIEW:::', foregroundView)
            console.log('CVIEW:::', containerView_1)

            if (!cell.foregroundViewTNS) {
                cell.foregroundViewWeakRef = new WeakRef(foregroundView);
                isForegroundViewToBeConstrainedIn = true;
            } else if (cell.foregroundViewTNS !== foregroundView) {
                isForegroundViewToBeConstrainedIn = true;
                this._removeContainer(cell);
                cell.foregroundViewTNS.nativeViewProtected.removeFromSuperview();
                cell.foregroundViewWeakRef = new WeakRef(foregroundView);
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
                        .then(function(result) {
                            _this._setCachedDetailData(index, result);
                            containerView_1.bindingContext = result;
                        })
                        .catch(function(e) { console.error("ERROR LOADING DETAILS:", e); });
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
            var estimatedRowHeight = view_1.layout.toDeviceIndependentPixels(cellHeight.foreground);
            if (this._ios.estimatedRowHeight !== estimatedRowHeight) {
                this._ios.estimatedRowHeight = estimatedRowHeight;
            }
            cell.resetNativeViews(cellHeight);
        } finally {
            this._preparingCell = false;
        }
        return cellHeight;
    };
    FoldingListView.prototype._removeContainer = function(cell) {
        var foregroundView = cell.foregroundViewTNS;
        var containerView = cell.containerViewTNS;
        if (foregroundView.parent) {
            if (!(foregroundView.parent instanceof FoldingListView)) {
                foregroundView.parent._removeView(foregroundView);
                // this._removeView(foregroundView.parent);
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
        // if (foregroundView.parent) {
        //     foregroundView.parent._removeView(foregroundView);
        // }
        // if (containerView.parent) {
        //     containerView.parent._removeView(containerView);
        // }
        this._preparingCell = preparing;
        this._map.delete(cell);
    };
    FoldingListView.prototype[folding_list_view_common_1.separatorColorProperty.getDefault] = function() {
        return this.ios.separatorColor;
    };
    FoldingListView.prototype[folding_list_view_common_1.separatorColorProperty.setNative] = function(value) {
        this.ios.separatorColor = value instanceof folding_list_view_common_1.Color ? value.ios : value;
    };
    FoldingListView.prototype.isItemAtIndexVisible = function(index) {
        var indexes = Array.from(this.ios.indexPathsForVisibleRows);
        return indexes.some(function(visIndex) { return visIndex.row === index; });
    };
    FoldingListView.prototype[folding_list_view_common_1.backViewColorProperty.getDefault] = function() {
        return (FoldingListViewCell.alloc().init()).backViewColor;
    };
    FoldingListView.prototype[folding_list_view_common_1.backViewColorProperty.setNative] = function(value) {
        var actualColor = value instanceof view_1.Color ? value.ios : value;
        this._map.forEach(function(view, cell) { cell.backViewColor = actualColor; });
    };
    FoldingListView.prototype[folding_list_view_common_1.itemTemplatesProperty.getDefault] = function() {
        return null;
    };
    FoldingListView.prototype[folding_list_view_common_1.itemTemplatesProperty.setNative] = function(value) {
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        if (value) {
            for (var i = 0, length_1 = value.length; i < length_1; i++) {
                this.ios.registerClassForCellReuseIdentifier(FoldingListViewCell.class(), value[i].key);
            }
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.refresh();
    };
    FoldingListView.prototype._measureConstraintedChild = function(view, measuredHeight) {
        return view_1.View.measureChild(this, view, this.widthMeasureSpec - (view._constraintLeft + view._constraintRight), measuredHeight);
    };
    FoldingListView.prototype._layoutConstraintedView = function(view, width, height) {
        folding_list_view_common_1.View.layoutChild(this, view, 0, 0, width - (view._constraintLeft + view._constraintRight), height - view._constraintTop);
    };
    FoldingListView.prototype._layoutCell = function(cellView) {
        if (cellView) {
            var measureForegroundSize = this._measureConstraintedChild(cellView.foreground, view_1.layout.makeMeasureSpec(this._effectiveFoldedRowHeight, view_1.layout.EXACTLY));
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
    FoldingListView.prototype._prepareConstrainedView = function(view) {
        view._constraintTop = view_1.PercentLength.toDevicePixels(view.marginTop);
        view._constraintLeft = view_1.PercentLength.toDevicePixels(view.marginLeft) + this.effectivePaddingLeft;
        view._constraintBottom = view_1.PercentLength.toDevicePixels(view.marginBottom);
        view._constraintRight = view_1.PercentLength.toDevicePixels(view.marginRight) + this.effectivePaddingRight;
        view.margin = "0";
    };
    __decorate([
        profiling_1.profile
    ], FoldingListView.prototype, "onLoaded", null);
    return FoldingListView;
}(folding_list_view_common_1.FoldingListViewBase));
exports.FoldingListView = FoldingListView;


var FoldingListViewCell = (function(_super) {
    __extends(FoldingListViewCell, _super);

    function FoldingListViewCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FoldingListViewCell.initWithEmptyBackground = function() {
        var cell = FoldingListViewCell.new();
        cell.backgroundColor = UIColor.purpleColor;
        return cell;
    };
    Object.defineProperty(FoldingListViewCell.prototype, "foregroundViewTNS", {
        get: function() {
            return this.foregroundViewWeakRef ? this.foregroundViewWeakRef.get() : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FoldingListViewCell.prototype, "containerViewTNS", {
        get: function() {
            return this.containerViewWeakRef ? this.containerViewWeakRef.get() : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FoldingListViewCell.prototype, "view", {
        get: function() {
            return this.owner ? this.owner.get() : null;
        },
        enumerable: true,
        configurable: true
    });
    FoldingListViewCell.prototype.willMoveToSuperview = function(newSuperview) {
        var parent = (this.foregroundViewTNS ? this.foregroundViewTNS.parent : null);
        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    };
    FoldingListViewCell.prototype.resetNativeViews = function(cellHeight) {
        // var parent = (this.foregroundViewTNS ? this.foregroundViewTNS.parent : null);
        for (var loop = this.contentView.subviews.count - 1; loop >= 0; loop--) {
            this.contentView.subviews.objectAtIndex(loop).removeFromSuperview();
        }
        this._addContainerView(cellHeight);
        this._addForegroundView(cellHeight);
        this.commonInit();


        // this._initForegroundView(cellHeight.foreground);
        // this._initContainerView(cellHeight.container);
        // this.backViewColor = parent.backViewColor.ios;
        // this.commonInit();
    };

    FoldingListViewCell.prototype.initWithStyleReuseIdentifier = function(style, reuseIdentifier) {
        var cell = _super.prototype.initWithStyleReuseIdentifier.call(this, style, reuseIdentifier);
        cell.backgroundColor = null;
        return cell;
    };


    FoldingListViewCell.prototype.resetContainerViewHeightContraint = function(newHeight) {
        var containerViewHeight = newHeight.container;

        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(this.containerViewTNS._constraintTop);
        if (this._containerViewHeightConstraints) {
            NSLayoutConstraint.deactivateConstraints(this._containerViewHeightConstraints);
        }
        this._containerViewHeightConstraints = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(containerViewHeight) - topConstraintValue) + ")]", 0, null, { layer: this.containerView });
        NSLayoutConstraint.activateConstraints(this._containerViewHeightConstraints);
    };
    FoldingListViewCell.prototype.animationDurationType = function(itemIndex, type) {
        // var parent = (this.foregroundViewTNS ? this.foregroundViewTNS.parent : null);
        // return parent.foldAnimationDuration / 1000;
        return 0.33;
    };
    FoldingListViewCell.prototype._bindContainerView = function(index, dataItem) {
        var containerView = this.containerViewTNS;
        var parent = containerView.parent;
        var width = view_1.layout.getMeasureSpecSize(parent.widthMeasureSpec);
        containerView.bindingContext = dataItem;
        var size = parent._measureConstraintedChild(containerView, infinity);
        var cellHeight = parent.getHeight(index);
        cellHeight.container = size.measuredHeight + containerView._constraintTop;
        parent.setHeight(index, cellHeight);
        if (containerView && containerView.isLayoutRequired) {
            parent._layoutConstraintedView(containerView, width, cellHeight.container);
        }
        this.resetContainerViewHeightContraint(cellHeight.container);
    };
    FoldingListViewCell.prototype._initForegroundView = function(height) {
        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(this.foregroundViewTNS._constraintTop);
        var foregroundView = RotatedView.alloc().initWithFrame(CGRectZero);
        foregroundView.translatesAutoresizingMaskIntoConstraints = false;
        foregroundView.addSubview(this.foregroundViewTNS.nativeViewProtected);
        this.contentView.addSubview(foregroundView);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(height) - topConstraintValue) + ")]", 0, null, { layer: foregroundView }));
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(this.foregroundViewTNS._constraintLeft) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(this.foregroundViewTNS._constraintRight) + "-|", 0, null, { layer: foregroundView }));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: foregroundView });
        NSLayoutConstraint.activateConstraints(top);
        this.foregroundView = foregroundView;
        this.foregroundViewTop = top.objectAtIndex(0);
    };
    FoldingListViewCell.prototype._initContainerView = function(height) {
        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(this.containerViewTNS._constraintTop);
        var containerView = UIView.alloc().initWithFrame(CGRectZero);
        containerView.translatesAutoresizingMaskIntoConstraints = false;
        containerView.addSubview(this.containerViewTNS.nativeViewProtected);
        this.contentView.addSubview(containerView);
        this.containerView = containerView;
        this.resetContainerViewHeightContraint(height);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(this.containerViewTNS._constraintLeft) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(this.containerViewTNS._constraintRight) + "-|", 0, null, { layer: containerView }));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: containerView });
        NSLayoutConstraint.activateConstraints(top);
        this.containerViewTop = top.objectAtIndex(0);
        containerView.layoutIfNeeded();
    };

    FoldingListViewCell.prototype._addForegroundView = function(height) {
        // height = 300;

        var foregroundViewHeight = height.foreground
        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(10);
        var foregroundView = RotatedView.alloc().initWithFrame(CGRectZero);
        foregroundView.translatesAutoresizingMaskIntoConstraints = false;
        foregroundView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(208, 72, 30, 1)
            // var newFrame = foregroundView.frame


        // newFrame.size.width = 250
        // newFrame.size.height = 600

        // foregroundView.frame = newFrame

        foregroundView.layer.cornerRadius = 2
        foregroundView.layer.borderWidth = 100;
        foregroundView.layer.borderColor = UIColor.blackColor;
        foregroundView.userInteractionEnabled = true;

        console.log('foregroundViewTNS.nativeViewProtected', this.foregroundViewTNS.nativeViewProtected)
        foregroundView.addSubview(this.foregroundViewTNS.nativeViewProtected);

        this.contentView.addSubview(foregroundView);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(foregroundViewHeight) - topConstraintValue) + ")]", 0, null, { layer: foregroundView }));
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(10) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: foregroundView }));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: foregroundView });
        NSLayoutConstraint.activateConstraints(top);
        this.foregroundView = foregroundView;

        if (this.foregroundView.bounds && this.foregroundView.bounds.size) {
            console.log('Forground:::Bounds:::', this.foregroundView.bounds.size)
        }
        this.foregroundViewTop = top.objectAtIndex(0);

    };

    FoldingListViewCell.prototype._addContainerView = function(height) {
        // height = 550;
        // var containerViewHeight = height.foreground


        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(10);
        var containerView = UIView.alloc().initWithFrame(CGRectZero);
        containerView.translatesAutoresizingMaskIntoConstraints = false;
        containerView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(139, 65, 56, 1)
            // containerView.hidden = true;
            // var newFrame = containerView.frame

        // newFrame.size.width = 150
        // newFrame.size.height = 300
        // containerView.frame = newFrame

        containerView.layer.cornerRadius = 2
        containerView.layer.borderWidth = 100
        containerView.layer.borderColor = UIColor.colorWithRedGreenBlueAlpha(17, 53, 56, 1)
        containerView.userInteractionEnabled = true;
        containerView.addSubview(this.containerViewTNS.nativeViewProtected);
        console.log('containerViewTNS.nativeViewProtected', this.containerViewTNS.nativeViewProtected)
        this.contentView.addSubview(containerView);
        this.containerView = containerView;
        this.resetContainerViewHeightContraint(height);
        NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(10) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: containerView }));
        var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: containerView });
        NSLayoutConstraint.activateConstraints(top);
        this.containerViewTop = top.objectAtIndex(0);
        containerView.layoutIfNeeded();

        if (this.containerView.bounds && this.containerView.bounds.size) {
            console.log('Container:::Bounds:::', this.containerView.bounds.size)
        }
    };

    return FoldingListViewCell;
}(FoldingCell));

var FoldingListViewDelegate = (function(_super) {
    __extends(FoldingListViewDelegate, _super);

    function FoldingListViewDelegate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FoldingListViewDelegate_1 = FoldingListViewDelegate;
    FoldingListViewDelegate.initWithOwner = function(owner) {
        var delegate = FoldingListViewDelegate_1.new();
        delegate._owner = owner;
        delegate._measureCellMap = new Map();
        return delegate;
    };
    FoldingListViewDelegate.prototype.tableViewHeightForRowAtIndexPath = function(tableView, indexPath) {
        var owner = this._owner.get();
        var cellHeight = owner.getHeight(indexPath.row);
        if (!cellHeight) {
            return folding_list_view_common_1.layout.toDeviceIndependentPixels(owner._effectiveFoldedRowHeight);
        }
        return folding_list_view_common_1.layout.toDeviceIndependentPixels(owner._getIsCellExpandedIn(indexPath.row) ? cellHeight.container : cellHeight.foreground);
    };
    FoldingListViewDelegate.prototype.tableViewWillSelectRowAtIndexPath = function(tableView, indexPath) {
        var cell = tableView.cellForRowAtIndexPath(indexPath);
        var owner = this._owner.get();
        if (owner) {
            notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
        }
        return indexPath;
    };
    FoldingListViewDelegate.prototype.tableViewDidSelectRowAtIndexPath = function(tableView, indexPath) {
        var _this = this;
        var cell = tableView.cellForRowAtIndexPath(indexPath);
        var owner = this._owner.get();
        if (cell.isAnimating()) {
            return;
        }
        var isExpandedIn = !(owner._getIsCellExpandedIn(indexPath.row));
        var index = indexPath.row;
        if (isExpandedIn && owner.detailDataLoader) {
            owner._getDetailDataLoaderPromise(index)
                .then(function(value) {
                    cell._bindContainerView(index, value);
                    owner._setCachedDetailData(index, value);
                    setTimeout(function() { _this._performCellUnfold(cell, index, isExpandedIn); }, 1);
                })
                .catch(function(e) { console.error("ERROR LOADING DETAILS:", e); });
        } else {
            this._performCellUnfold(cell, index, isExpandedIn);
        }
        if (!isExpandedIn) {
            owner.invalidateChachedDetailData(index);
        }

        // tableView.deselectRowAtIndexPathAnimated(indexPath, true);
        // return indexPath;

    };
    FoldingListViewDelegate.prototype.tableViewWillDisplayCellForRowAtIndexPath = function(tableView, cell, indexPath) {
        var foldingCell = cell;
        var owner = this._owner.get();
        var isExpandedIn = !!(owner._getIsCellExpandedIn(indexPath.row));
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify({
                eventName: folding_list_view_common_1.FoldingListViewBase.loadMoreItemsEvent,
                object: owner,
            });
        }
        foldingCell.unfoldAnimatedCompletion(isExpandedIn, false, null);
    };
    FoldingListViewDelegate.prototype._performCellUnfold = function(cell, index, isExpandedIn) {
        var owner = this._owner.get();
        if (owner.toggleMode && isExpandedIn) {
            var expandedIndex_1 = owner._cellExpanded.findIndex(function(value) { return value; });
            var expandedCell_1;
            owner._map.forEach(function(value, key) {
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
        UIView.animateWithDurationDelayOptionsAnimationsCompletion(duration, 0, 131072, function() {
            owner.ios.beginUpdates();
            owner.ios.endUpdates();
        }, null);
    };
    FoldingListViewDelegate = FoldingListViewDelegate_1 = __decorate([
        ObjCClass(UITableViewDelegate)
    ], FoldingListViewDelegate);
    return FoldingListViewDelegate;
    var FoldingListViewDelegate_1;
}(NSObject));


function notifyForItemAtIndex(listView, cell, view, eventName, indexPath) {
    var args = { eventName: eventName, object: listView, index: indexPath.row, view: view, ios: cell, android: undefined };
    listView.notify(args);
    return args;
}

var FoldingListViewDataSource = (function(_super) {
    __extends(FoldingListViewDataSource, _super);

    function FoldingListViewDataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FoldingListViewDataSource_1 = FoldingListViewDataSource;
    FoldingListViewDataSource.initWithOwner = function(owner) {
        var dataSource = FoldingListViewDataSource_1.new();
        dataSource._owner = owner;
        return dataSource;
    };
    FoldingListViewDataSource.prototype.tableViewNumberOfRowsInSection = function(tableView, section) {
        var owner = this._owner.get();
        return (owner && owner.items) ? owner.items.length : 0;
    };
    FoldingListViewDataSource.prototype.tableViewCellForRowAtIndexPath = function(tableView, indexPath) {
        var owner = this._owner.get();
        var cell;
        if (owner) {
            var template = owner._getItemTemplate(indexPath.row);
            cell = (tableView.dequeueReusableCellWithIdentifier(template.key) || FoldingListViewCell.initWithEmptyBackground());
            var cellHeight = owner._prepareCell(cell, indexPath);
            var width = folding_list_view_common_1.layout.getMeasureSpecSize(owner.widthMeasureSpec);
            var foregroundView = cell.foregroundViewTNS;
            if (foregroundView && foregroundView.isLayoutRequired) {
                owner._layoutConstraintedView(foregroundView, width, cellHeight.foreground);
            }
            var containerView = cell.containerViewTNS;
            if (containerView && containerView.isLayoutRequired) {
                owner._layoutConstraintedView(containerView, width, cellHeight.container);
            }
            cell.itemCount = owner.foldsCount;
        } else {
            cell = FoldingListViewCell.initWithEmptyBackground();
        }
        return cell;
    };
    FoldingListViewDataSource = FoldingListViewDataSource_1 = __decorate([
        ObjCClass(UITableViewDataSource)
    ], FoldingListViewDataSource);
    return FoldingListViewDataSource;
    var FoldingListViewDataSource_1;
}(NSObject));

var UITableViewRowHeightDelegateImpl = (function(_super) {
    __extends(UITableViewRowHeightDelegateImpl, _super);

    function UITableViewRowHeightDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITableViewRowHeightDelegateImpl.initWithOwner = function(owner) {
        var delegate = UITableViewRowHeightDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewWillDisplayCellForRowAtIndexPath = function(tableView, cell, indexPath) {
        console.log('View Will Display Cell Row Height:::', tableView, cell, indexPath);

        var owner = this._owner.get();
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify({ eventName: LOADMOREITEMS, object: owner });
        }
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewWillSelectRowAtIndexPath = function(tableView, indexPath) {
        console.log('View Will Select Row Height:::', tableView, indexPath);

        var cell = tableView.cellForRowAtIndexPath(indexPath);
        var owner = this._owner.get();
        if (owner) {
            notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
        }

        return indexPath;
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewDidSelectRowAtIndexPath = function(tableView, indexPath) {
        console.log('View Did Select Row Height:::', tableView, indexPath);

        tableView.deselectRowAtIndexPathAnimated(indexPath, true);
        return indexPath;
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewHeightForRowAtIndexPath = function(tableView, indexPath) {
        console.log('View Height Row Height:::', tableView, cell, indexPath);

        var owner = this._owner.get();
        if (!owner) {
            return tableView.estimatedRowHeight;
        }
        return folding_list_view_common_1.layout.toDeviceIndependentPixels(owner._effectiveRowHeight);
    };
    UITableViewRowHeightDelegateImpl.ObjCProtocols = [UITableViewDelegate];
    return UITableViewRowHeightDelegateImpl;
}(NSObject));






var ForegroundView_1 = (function(_super) {
    __extends(ForegroundView_1, _super);

    function ForegroundView_1() {

        var _this = _super !== null && _super.apply(this, arguments) || this;

        // var topConstraintValue = view_1.layout.toDeviceIndependentPixels(10);
        // var foregroundView = RotatedView.alloc().initWithFrame(CGRectZero);

        // var height = 800;
        // foregroundView.translatesAutoresizingMaskIntoConstraints = false;
        // foregroundView.backgroundColor = UIColor.purpleColor
        // foregroundView.layer.borderColor = UIColor.greenColor;
        // foregroundView.userInteractionEnabled = true;

        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(height) - topConstraintValue) + ")]", 0, null, { layer: foregroundView }));
        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(10) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: foregroundView }));
        // var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: foregroundView });
        // NSLayoutConstraint.activateConstraints(top);

        // _this._ios = foregroundView;

        return _this;
    }


    Object.defineProperty(ForegroundView_1.prototype, "ios", {
        get: function() {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });

    folding_list_view_common_1
    ForegroundView_1.prototype.createNativeView = function() {

        var height = 800;
        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(10);
        var foregroundView = RotatedView.alloc().initWithFrame(CGRectZero);

        foregroundView.translatesAutoresizingMaskIntoConstraints = false;
        foregroundView.backgroundColor = UIColor.purpleColor
        foregroundView.layer.borderColor = UIColor.greenColor;
        foregroundView.userInteractionEnabled = true;

        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(height) - topConstraintValue) + ")]", 0, null, { layer: foregroundView }));
        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(10) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: foregroundView }));
        // var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: foregroundView });
        // NSLayoutConstraint.activateConstraints(top);

        this._ios = foregroundView;

        return this._ios;
    };

    ForegroundView_1.prototype.initNativeView = function() {
        _super.prototype.initNativeView.call(this);
    };
    ForegroundView_1.prototype.onMeasure = function(widthMeasureSpec, heightMeasureSpec) {
        var _this = this;
        _super.prototype.onMeasure.call(this, widthMeasureSpec, heightMeasureSpec);
        var measureWidth = 0;
        var measureHeight = 0;
        var width = folding_list_view_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = folding_list_view_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = folding_list_view_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = folding_list_view_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var isVertical = this.orientation === "vertical";
        var horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        var verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;
        var measureSpec;
        var mode = isVertical ? heightMode : widthMode;
        var remainingLength;
        if (mode === folding_list_view_common_1.layout.UNSPECIFIED) {
            measureSpec = folding_list_view_common_1.layout.UNSPECIFIED;
            remainingLength = 0;
        } else {
            measureSpec = folding_list_view_common_1.layout.AT_MOST;
            remainingLength = isVertical ? height - verticalPaddingsAndMargins : width - horizontalPaddingsAndMargins;
        }
        var childMeasureSpec;
        var childWidth = (widthMode === folding_list_view_common_1.layout.UNSPECIFIED) ? 0 : width - horizontalPaddingsAndMargins;
        childWidth = Math.max(0, childWidth);
        childMeasureSpec = folding_list_view_common_1.layout.makeMeasureSpec(childWidth, widthMode);

        var childSize;
        this.eachLayoutChild(function(child, last) {
            childSize = folding_list_view_common_1.View.measureChild(_this, child, childMeasureSpec, folding_list_view_common_1.layout.makeMeasureSpec(remainingLength, measureSpec));
            if (measureSpec === folding_list_view_common_1.layout.AT_MOST && _this.isUnsizedScrollableView(child)) {
                trace.write("Avoid using ListView or ScrollView with no explicit height set inside StackLayout. Doing so might result in poor user interface performance and poor user experience.", trace.categories.Layout, trace.messageType.warn);
            }
            measureWidth = Math.max(measureWidth, childSize.measuredWidth);
            var viewHeight = childSize.measuredHeight;
            measureHeight += viewHeight;
            remainingLength = Math.max(0, remainingLength - viewHeight);
        });
        measureWidth += horizontalPaddingsAndMargins;
        measureHeight += verticalPaddingsAndMargins;
        measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
        measureHeight = Math.max(measureHeight, this.effectiveMinHeight);
        this._totalLength = isVertical ? measureHeight : measureWidth;
        var widthAndState = folding_list_view_common_1.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = folding_list_view_common_1.View.resolveSizeAndState(measureHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    ForegroundView_1.prototype.onLayout = function(left, top, right, bottom) {
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        var insets = this.getSafeAreaInsets();
        this.layoutVertical(left, top, right, bottom, insets);
    };
    ForegroundView_1.prototype.layoutVertical = function(left, top, right, bottom, insets) {
        var _this = this;
        var paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
        var paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;
        var paddingRight = this.effectiveBorderRightWidth + this.effectivePaddingRight + insets.right;
        var paddingBottom = this.effectiveBorderBottomWidth + this.effectivePaddingBottom + insets.bottom;
        var childTop;
        var childLeft = paddingLeft;
        var childRight = right - left - paddingRight;
        switch (this.verticalAlignment) {
            case folding_list_view_common_1.VerticalAlignment.MIDDLE:
                childTop = (bottom - top - this._totalLength) / 2 + paddingTop - paddingBottom;
                break;
            case folding_list_view_common_1.VerticalAlignment.BOTTOM:
                childTop = bottom - top - this._totalLength + paddingTop - paddingBottom;
                break;
            case folding_list_view_common_1.VerticalAlignment.TOP:
            case folding_list_view_common_1.VerticalAlignment.STRETCH:
            default:
                childTop = paddingTop;
                break;
        }
        this.eachLayoutChild(function(child, last) {
            var childHeight = child.getMeasuredHeight() + child.effectiveMarginTop + child.effectiveMarginBottom;
            folding_list_view_common_1.View.layoutChild(_this, child, childLeft, childTop, childRight, childTop + childHeight);
            childTop += childHeight;
        });
    };
    ForegroundView_1.prototype.isUnsizedScrollableView = function(child) {
        if (child.height === "auto" && (child.ios instanceof UITableView || child.ios instanceof UIScrollView)) {
            return true;
        }
        return false;
    };
    ForegroundView_1.prototype.addChild = function(child) {
        _super.prototype.addChild.call(this, child);
    };
    ForegroundView_1.prototype.insertChild = function(child, atIndex) {
        _super.prototype.addChild.call(this, child, atIndex);
        console.log('Inserted Child', child);
    };
    return ForegroundView_1;
}(folding_list_view_common_1.ForegroundViewCommom));
exports.ForegroundView = ForegroundView_1;



var ContainerView_1 = (function(_super) {
    __extends(ContainerView_1, _super);

    function ContainerView_1() {

        var _this = _super !== null && _super.apply(this, arguments) || this;

        // var height = 300;
        // var topConstraintValue = view_1.layout.toDeviceIndependentPixels(10);
        // var containerView = UIView.alloc().initWithFrame(CGRectZero);

        // containerView.translatesAutoresizingMaskIntoConstraints = false;
        // containerView.backgroundColor = UIColor.purpleColor
        // containerView.layer.borderColor = UIColor.greenColor;
        // containerView.userInteractionEnabled = true;

        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(height) - topConstraintValue) + ")]", 0, null, { layer: containerView }));
        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(10) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: containerView }));
        // var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: containerView });
        // NSLayoutConstraint.activateConstraints(top);

        // _this._ios = containerView;

        return _this;
    }


    Object.defineProperty(ContainerView_1.prototype, "ios", {
        get: function() {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });


    ContainerView_1.prototype.createNativeView = function() {

        var topConstraintValue = view_1.layout.toDeviceIndependentPixels(10);
        var containerView = UIView.alloc().initWithFrame(CGRectZero);
        var height = 300;

        containerView.translatesAutoresizingMaskIntoConstraints = false;
        containerView.backgroundColor = UIColor.purpleColor
        containerView.layer.borderColor = UIColor.greenColor;
        containerView.userInteractionEnabled = true;

        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:[layer(==" + (view_1.layout.toDeviceIndependentPixels(height) - topConstraintValue) + ")]", 0, null, { layer: containerView }));
        // NSLayoutConstraint.activateConstraints(NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("H:|-" + view_1.layout.toDeviceIndependentPixels(10) + "-[layer]-" + view_1.layout.toDeviceIndependentPixels(10) + "-|", 0, null, { layer: containerView }));
        // var top = NSLayoutConstraint.constraintsWithVisualFormatOptionsMetricsViews("V:|-" + topConstraintValue + "-[layer]", 0, null, { layer: containerView });
        // NSLayoutConstraint.activateConstraints(top);

        this._ios = containerView;

        return this._ios;
    };

    ContainerView_1.prototype.initNativeView = function() {
        _super.prototype.initNativeView.call(this);
    };
    ContainerView_1.prototype.onMeasure = function(widthMeasureSpec, heightMeasureSpec) {
        var _this = this;
        _super.prototype.onMeasure.call(this, widthMeasureSpec, heightMeasureSpec);
        var measureWidth = 0;
        var measureHeight = 0;
        var width = folding_list_view_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = folding_list_view_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = folding_list_view_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = folding_list_view_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var isVertical = this.orientation === "vertical";
        var horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        var verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;
        var measureSpec;
        var mode = isVertical ? heightMode : widthMode;
        var remainingLength;
        if (mode === folding_list_view_common_1.layout.UNSPECIFIED) {
            measureSpec = folding_list_view_common_1.layout.UNSPECIFIED;
            remainingLength = 0;
        } else {
            measureSpec = folding_list_view_common_1.layout.AT_MOST;
            remainingLength = isVertical ? height - verticalPaddingsAndMargins : width - horizontalPaddingsAndMargins;
        }
        var childMeasureSpec;
        var childWidth = (widthMode === folding_list_view_common_1.layout.UNSPECIFIED) ? 0 : width - horizontalPaddingsAndMargins;
        childWidth = Math.max(0, childWidth);
        childMeasureSpec = folding_list_view_common_1.layout.makeMeasureSpec(childWidth, widthMode);

        var childSize;
        this.eachLayoutChild(function(child, last) {
            childSize = folding_list_view_common_1.View.measureChild(_this, child, childMeasureSpec, folding_list_view_common_1.layout.makeMeasureSpec(remainingLength, measureSpec));
            if (measureSpec === folding_list_view_common_1.layout.AT_MOST && _this.isUnsizedScrollableView(child)) {
                trace.write("Avoid using ListView or ScrollView with no explicit height set inside StackLayout. Doing so might result in poor user interface performance and poor user experience.", trace.categories.Layout, trace.messageType.warn);
            }
            measureWidth = Math.max(measureWidth, childSize.measuredWidth);
            var viewHeight = childSize.measuredHeight;
            measureHeight += viewHeight;
            remainingLength = Math.max(0, remainingLength - viewHeight);
        });
        measureWidth += horizontalPaddingsAndMargins;
        measureHeight += verticalPaddingsAndMargins;
        measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
        measureHeight = Math.max(measureHeight, this.effectiveMinHeight);
        this._totalLength = isVertical ? measureHeight : measureWidth;
        var widthAndState = folding_list_view_common_1.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = folding_list_view_common_1.View.resolveSizeAndState(measureHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    ContainerView_1.prototype.onLayout = function(left, top, right, bottom) {
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        var insets = this.getSafeAreaInsets();
        this.layoutVertical(left, top, right, bottom, insets);
    };
    ContainerView_1.prototype.layoutVertical = function(left, top, right, bottom, insets) {
        var _this = this;
        var paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft + insets.left;
        var paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop + insets.top;
        var paddingRight = this.effectiveBorderRightWidth + this.effectivePaddingRight + insets.right;
        var paddingBottom = this.effectiveBorderBottomWidth + this.effectivePaddingBottom + insets.bottom;
        var childTop;
        var childLeft = paddingLeft;
        var childRight = right - left - paddingRight;
        switch (this.verticalAlignment) {
            case folding_list_view_common_1.VerticalAlignment.MIDDLE:
                childTop = (bottom - top - this._totalLength) / 2 + paddingTop - paddingBottom;
                break;
            case folding_list_view_common_1.VerticalAlignment.BOTTOM:
                childTop = bottom - top - this._totalLength + paddingTop - paddingBottom;
                break;
            case folding_list_view_common_1.VerticalAlignment.TOP:
            case folding_list_view_common_1.VerticalAlignment.STRETCH:
            default:
                childTop = paddingTop;
                break;
        }
        this.eachLayoutChild(function(child, last) {
            var childHeight = child.getMeasuredHeight() + child.effectiveMarginTop + child.effectiveMarginBottom;
            folding_list_view_common_1.View.layoutChild(_this, child, childLeft, childTop, childRight, childTop + childHeight);
            childTop += childHeight;
        });
    };
    ContainerView_1.prototype.isUnsizedScrollableView = function(child) {
        if (child.height === "auto" && (child.ios instanceof UITableView || child.ios instanceof UIScrollView)) {
            return true;
        }
        return false;
    };
    ContainerView_1.prototype.addChild = function(child) {
        _super.prototype.addChild.call(this, child);
    };
    ContainerView_1.prototype.insertChild = function(child, atIndex) {
        _super.prototype.addChild.call(this, child, atIndex);
        console.log('Inserted Child', child);
    };
    return ContainerView_1;
}(folding_list_view_common_1.ContainerViewCommom));
exports.ContainerView = ContainerView_1;



var TapHandlerImpl = (function(_super) {
    __extends(TapHandlerImpl, _super);

    function TapHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TapHandlerImpl.initWithOwner = function(owner) {
        var handler = TapHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    TapHandlerImpl.prototype.tap = function(args) {
        var owner = this._owner.get();
        if (owner) {
            owner._emit(folding_list_view_common_1.FoldingListViewBase.tapEvent);
        }
    };
    TapHandlerImpl.ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
    return TapHandlerImpl;
}(NSObject));