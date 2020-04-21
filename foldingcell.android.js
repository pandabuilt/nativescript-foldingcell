"use strict";

function __export(m) {
    for (var p in m)
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("@nativescript/core/data/observable/observable");
var view_1 = require("@nativescript/core/ui/core/view");
var folding_list_view_common_1 = require("./foldingcell.common");
__export(require("./foldingcell.common"));
var ItemClickListener;

function initializeItemClickListener() {
    if (ItemClickListener) {
        return;
    }
    var ItemClickListenerImpl = (function(_super) {
        __extends(ItemClickListenerImpl, _super);

        function ItemClickListenerImpl(owner) {
            var _this = _super.call(this) || this;
            _this.owner = owner;
            return global.__native(_this);
        }
        ItemClickListenerImpl.prototype.onItemClick = function(parent, convertView, index, id) {
            var _this = this;
            var owner = this.owner;
            var cell = convertView;
            var isExpandedIn = owner._getIsCellExpandedIn(index);
            var cellView = owner._realizedItems.get(cell);
            if (!isExpandedIn && owner.detailDataLoader) {
                owner._getDetailDataLoaderPromise(index)
                    .then(function(result) {
                        owner._setCachedDetailData(index, result);
                        cellView.container.bindingContext = result;
                        _this._toggleCell(cell, index);
                    })
                    .catch(function(e) { console.error("ERROR LOADING DETAILS:", e); });
            } else {
                this._toggleCell(cell, index);
            }
            if (!isExpandedIn) {
                owner.invalidateChachedDetailData(index);
            }
        };
        ItemClickListenerImpl.prototype._toggleCell = function(cell, index) {
            var owner = this.owner;
            var isExpandedIn = owner._getIsCellExpandedIn(index);
            if (owner.toggleMode && !isExpandedIn) {
                var expandedIndex_1 = owner._cellExpanded.findIndex(function(value) { return value; });
                var expandedCell_1;
                owner._realizedItems.forEach(function(cellView, currentCell) {
                    if (cellView.index === expandedIndex_1) {
                        expandedCell_1 = currentCell;
                    }
                });
                if (!expandedCell_1) {
                    owner._setIsCellExpandedIn(expandedIndex_1, false);
                } else {
                    this._toggleCell(expandedCell_1, expandedIndex_1);
                }
            }
            cell.toggle(false);
            owner._setIsCellExpandedIn(index, !isExpandedIn);
        };
        ItemClickListenerImpl = __decorate([
            Interfaces([android.widget.AdapterView.OnItemClickListener])
        ], ItemClickListenerImpl);
        return ItemClickListenerImpl;
    }(java.lang.Object));
    ItemClickListener = ItemClickListenerImpl;
}
var FoldingListView = (function(_super) {
    __extends(FoldingListView, _super);

    function FoldingListView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._realizedItems = new Map();
        _this._realizedTemplates = new Map();
        // _this._realizedContainerTemplates = new Map();
        _this._androidViewId = -1;
        return _this;
    }
    Object.defineProperty(FoldingListView.prototype, "_childrenCount", {
        get: function() {
            return this._realizedItems.size;
        },
        enumerable: true,
        configurable: true
    });
    FoldingListView.prototype.createNativeView = function() {
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
        listView.adapter = adapter;
        var itemClickListener = new ItemClickListener(this);
        listView.setOnItemClickListener(itemClickListener);
        listView.itemClickListener = itemClickListener;
        return listView;
    };
    FoldingListView.prototype.initNativeView = function() {
        _super.prototype.initNativeView.call(this);
        _super.prototype.updateEffectiveFoldedRowHeight.call(this);
        var nativeView = this.nativeViewProtected;
        nativeView.itemClickListener.owner = this;
        var adapter = nativeView.adapter;
        adapter.owner = this;
        nativeView.setAdapter(adapter);
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }
        nativeView.setId(this._androidViewId);
    };
    FoldingListView.prototype.disposeNativeView = function() {
        var nativeView = this.nativeViewProtected;
        nativeView.setAdapter(null);
        nativeView.itemClickListener.owner = null;
        nativeView.adapter.owner = null;
        this.clearRealizedCells();
        _super.prototype.disposeNativeView.call(this);
    };
    FoldingListView.prototype.onLoaded = function() {
        _super.prototype.onLoaded.call(this);
        this.requestLayout();
    };
    FoldingListView.prototype.refresh = function() {
        var nativeView = this.nativeViewProtected;
        if (!nativeView || !nativeView.getAdapter()) {
            return;
        }
        var clearBindingContext = function(view) {
            if (!(view.bindingContext instanceof observable_1.Observable)) {
                view.bindingContext = null;
            }
        };
        this._realizedItems.forEach(function(view, cell) {
            clearBindingContext(view);
            // clearBindingContext(view.container);
        });
        nativeView.getAdapter().notifyDataSetChanged();
    };
    FoldingListView.prototype.scrollToIndex = function(index, animated) {
        if (animated === void 0) { animated = true; }
        var nativeView = this.nativeViewProtected;
        if (nativeView) {
            if (animated) {
                nativeView.smoothScrollToPosition(index);
            } else {
                nativeView.setSelection(index);
            }
        }
    };
    FoldingListView.prototype.eachChildView = function(callback) {
        var performCallback = function(view) {
            if (view.parent instanceof FoldingListView) {
                callback(view);
            } else {
                if (view.parent) {
                    callback(view.parent);
                }
            }
        };
        this._realizedItems.forEach(function(view, cell) {
            performCallback(view);
            // performCallback(view.container);
        });
    };
    FoldingListView.prototype.isItemAtIndexVisible = function(index) {
        var nativeView = this.nativeViewProtected;
        var start = nativeView.getFirstVisiblePosition();
        var end = nativeView.getLastVisiblePosition();
        return (index >= start && index <= end);
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingTopProperty.getDefault] = function() {
        return this.nativeView.getPaddingTop();
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingTopProperty.setNative] = function(value) {
        this._setPadding({ top: this.effectivePaddingTop });
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingRightProperty.getDefault] = function() {
        return this.nativeView.getPaddingRight();
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingRightProperty.setNative] = function(value) {
        this._setPadding({ right: this.effectivePaddingRight });
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingBottomProperty.getDefault] = function() {
        return this.nativeView.getPaddingBottom();
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingBottomProperty.setNative] = function(value) {
        this._setPadding({ bottom: this.effectivePaddingBottom });
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingLeftProperty.getDefault] = function() {
        return this.nativeView.getPaddingLeft();
    };
    FoldingListView.prototype[folding_list_view_common_1.paddingLeftProperty.setNative] = function(value) {
        this._setPadding({ left: this.effectivePaddingLeft });
    };
    FoldingListView.prototype[folding_list_view_common_1.separatorColorProperty.getDefault] = function() {
        var nativeView = this.nativeViewProtected;
        return {
            dividerHeight: nativeView.getDividerHeight(),
            divider: nativeView.getDivider()
        };
    };
    FoldingListView.prototype[folding_list_view_common_1.separatorColorProperty.setNative] = function(value) {
        var nativeView = this.nativeViewProtected;
        if (value instanceof folding_list_view_common_1.Color) {
            nativeView.setDivider(new android.graphics.drawable.ColorDrawable(value.android));
            nativeView.setDividerHeight(1);
        } else {
            nativeView.setDivider(value.divider);
            nativeView.setDividerHeight(value.dividerHeight);
        }
    };
    FoldingListView.prototype[folding_list_view_common_1.itemTemplatesProperty.getDefault] = function() {
        return null;
    };
    FoldingListView.prototype[folding_list_view_common_1.itemTemplatesProperty.setNative] = function(value) {
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        if (value) {
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.nativeViewProtected.setAdapter(new FoldingListViewAdapterClass(this));
        this.refresh();
    };
    // FoldingListView.prototype[folding_list_view_common_1.containerItemTemplatesProperty.getDefault] = function() {
    //     return null;
    // };
    // FoldingListView.prototype[folding_list_view_common_1.containerItemTemplatesProperty.setNative] = function(value) {
    //     this._containerItemTemplatesInternal = new Array(this._defaultContainerItemTemplate);
    //     if (value) {
    //         this._containerItemTemplatesInternal = this._containerItemTemplatesInternal.concat(value);
    //     }
    //     this.nativeViewProtected.setAdapter(new FoldingListViewAdapterClass(this));
    //     this.refresh();
    // };
    FoldingListView.prototype.clearRealizedCells = function() {
        var _this = this;
        var removeView = function(view) {
            if (view.parent) {
                if (!(view.parent instanceof FoldingListView)) {
                    _this._removeView(view.parent);
                }
                view.parent._removeView(view);
            }
        };
        this._realizedItems.forEach(function(view, nativeView) {
            removeView(view);
            // removeView(view.container);
        });
        this._realizedItems.clear();
        this._realizedTemplates.clear();
        // this._realizedContainerTemplates.clear();
    };
    FoldingListView.prototype._setPadding = function(newPadding) {
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
    return FoldingListView;
}(folding_list_view_common_1.FoldingListViewBase));
exports.FoldingListView = FoldingListView;
var FoldingListViewAdapterClass;

function ensureFoldingListViewAdapterClass() {
    if (FoldingListViewAdapterClass) {
        return;
    }
    var FoldingListViewAdapter = (function(_super) {
        __extends(FoldingListViewAdapter, _super);

        function FoldingListViewAdapter(owner) {
            var _this = _super.call(this) || this;
            _this.owner = owner;
            _this._templateKeys = new Array();
            for (var _i = 0, _a = owner._foregroundItemTemplatesInternal; _i < _a.length; _i++) {
                var foregroundItemTemplate = _a[_i];
                for (var _b = 0, _c = owner._containerItemTemplatesInternal; _b < _c.length; _b++) {
                    var containerItemTemplate = _c[_b];
                    _this._templateKeys.push(foregroundItemTemplate.key + "_" + containerItemTemplate.key);
                }
            }
            return global.__native(_this);
        }
        FoldingListViewAdapter.prototype.getCount = function() {
            return this.owner && this.owner.items && this.owner.items.length ? this.owner.items.length : 0;
        };
        FoldingListViewAdapter.prototype.getItem = function(i) {
            if (this.owner && this.owner.items && i < this.owner.items.length) {
                return this.owner._getDataItem(i);
            }
            return null;
        };
        FoldingListViewAdapter.prototype.getItemId = function(i) {
            return long(i);
        };
        FoldingListViewAdapter.prototype.hasStableIds = function() {
            return true;
        };
        FoldingListViewAdapter.prototype.getViewTypeCount = function() {
            return this._templateKeys.length;
        };
        FoldingListViewAdapter.prototype.getItemViewType = function(index) {
            var foregroundItemTemplate = this.owner._getForegroundItemTemplate(index);
            // var containerItemTemplate = this.owner._getContainerItemTemplate(index);
            return this._templateKeys.indexOf(foregroundItemTemplate.key + "_" + containerItemTemplate.key);
        };
        FoldingListViewAdapter.prototype.getView = function(index, convertView, parent) {
            if (!this.owner) {
                return null;
            }
            var totalItemCount = this.owner.items ? this.owner.items.length : 0;
            if (index === (totalItemCount - 1)) {
                this.owner.notify({
                    eventName: folding_list_view_common_1.FoldingListViewBase.loadMoreItemsEvent,
                    object: this.owner,
                });
            }
            var owner = this.owner;
            var template = owner._getItemTemplate(index);
            // var containerTemplate = owner._getContainerItemTemplate(index);
            var view;
            var foregroundView;
            var containerView;
            var cell = convertView;
            var isCellExpandedIn = owner._getIsCellExpandedIn(index);
            if (cell) {
                view = owner._realizedTemplates.get(template.key).get(cell);
                if (!view) {
                    throw new Error("There is no entry with key '" + cell + "' in the realized views cache for template with key'" + foregroundTemplate.key + "'.");
                }
                // containerView = owner._realizedContainerTemplates.get(containerTemplate.key).get(cell);
                // if (!containerView) {
                //     throw new Error("There is no entry with key '" + cell + "' in the realized views cache for template with key'" + containerTemplate.key + "'.");
                // }
            } else {
                view = owner._checkAndWrapProxyContainers(template.createView());

                if (view) {
                    var i = 0;
                    view.eachChildView(cv => {
                        if (i == 0) {
                            foregroundView = cv;
                        } else if (i == 1) {
                            containerView = cv;
                        }
                        i++;
                    })
                }

                owner._addView(view);
                // containerView = owner._checkAndWrapProxyContainers(containerTemplate.createView());
                // owner._addView(containerView);
                var context = owner._context;
                var MATCH_PARENT = android.view.ViewGroup.LayoutParams.MATCH_PARENT;
                var WRAP_CONTENT = android.view.ViewGroup.LayoutParams.WRAP_CONTENT;
                cell = new com.ramotion.foldingcell.FoldingCell(context);
                org.nativescript.widgets.ViewHelper.setWidth(cell, MATCH_PARENT);
                org.nativescript.widgets.ViewHelper.setHeight(cell, WRAP_CONTENT);
                var container = new android.widget.FrameLayout(context);
                org.nativescript.widgets.ViewHelper.setWidth(container, MATCH_PARENT);
                org.nativescript.widgets.ViewHelper.setHeight(container, WRAP_CONTENT);
                container.addView(containerView.nativeViewProtected);
                cell.addView(container);
                var foreground = new android.widget.FrameLayout(context);
                org.nativescript.widgets.ViewHelper.setWidth(foreground, MATCH_PARENT);
                org.nativescript.widgets.ViewHelper.setHeight(foreground, WRAP_CONTENT);
                foreground.addView(foregroundView.nativeViewProtected);
                cell.addView(foreground);
            }
            owner.notify({
                eventName: folding_list_view_common_1.FoldingListViewBase.itemLoadingEvent,
                object: owner,
                index: index,
                view: {
                    foreground: foregroundView,
                    container: containerView,
                },
                android: parent,
                ios: undefined,
            });
            cell.initialize(owner.foldsCount * owner.foldAnimationDuration, owner.backViewColor.android, owner.foldsCount - 2);
            foregroundView.height = view_1.layout.toDeviceIndependentPixels(owner._effectiveFoldedRowHeight);
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
                        .then(function(result) {
                            owner._setCachedDetailData(index, result);
                            containerView.bindingContext = result;
                        })
                        .catch(function(e) { console.error("ERROR LOADING DETAILS:", e); });
                }
            }
            var realizedItemsForTemplateKey = owner._realizedTemplates.get(template.key);
            if (!realizedItemsForTemplateKey) {
                realizedItemsForTemplateKey = new Map();
                owner._realizedTemplates.set(template.key, realizedItemsForTemplateKey);
            }
            realizedItemsForTemplateKey.set(cell, foregroundView);
            var realizedContainerItemsForTemplateKey = owner._realizedContainerTemplates.get(containerTemplate.key);
            if (!realizedContainerItemsForTemplateKey) {
                realizedContainerItemsForTemplateKey = new Map();
                owner._realizedContainerTemplates.set(containerTemplate.key, realizedContainerItemsForTemplateKey);
            }
            realizedContainerItemsForTemplateKey.set(cell, containerView);
            owner._realizedItems.set(cell, { foreground: foregroundView, container: containerView, index: index });
            if (!isCellExpandedIn) {
                org.nativescript.widgets.ViewHelper.setHeight(cell, view_1.PercentLength.toDevicePixels(foregroundView.height) +
                    view_1.PercentLength.toDevicePixels(foregroundView.marginTop) +
                    view_1.PercentLength.toDevicePixels(foregroundView.borderTopWidth) +
                    view_1.PercentLength.toDevicePixels(foregroundView.borderBottomWidth));
            }
            setTimeout(function() {
                if (isCellExpandedIn) {
                    cell.unfold(true);
                } else {
                    cell.getChildAt(0).setVisibility(android.view.View.GONE);
                    cell.fold(true);
                }
            }, 1);
            return cell;
        };
        return FoldingListViewAdapter;
    }(android.widget.BaseAdapter));
    FoldingListViewAdapterClass = FoldingListViewAdapter;
}