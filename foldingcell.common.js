// "use strict";

function __export(m) {
    for (var p in m)
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("@nativescript/core/data/observable");
var observable_array_1 = require("@nativescript/core/data/observable-array");
var builder_1 = require("@nativescript/core/ui/builder");
var properties_1 = require("@nativescript/core/ui/core/properties");
var view_1 = require("@nativescript/core/ui/core/view");
var weak_event_listener_1 = require("@nativescript/core/ui/core/weak-event-listener");
var label_1 = require("@nativescript/core/ui/label");
var layout_base_1 = require("@nativescript/core/ui/layouts/layout-base");
var stack_layout_1 = require("@nativescript/core/ui/layouts/stack-layout");
var proxy_view_container_1 = require("@nativescript/core/ui/proxy-view-container");
__export(require("@nativescript/core/ui/core/view"));

var knownTemplates;
(function(knownTemplates) {
    knownTemplates.itemTemplate = "itemTemplate";
})(knownTemplates = exports.knownTemplates || (exports.knownTemplates = {}));
var knownMultiTemplates;
(function(knownMultiTemplates) {
    knownMultiTemplates.itemTemplates = "itemTemplates";
})(knownMultiTemplates = exports.knownMultiTemplates || (exports.knownMultiTemplates = {}));

// var knownTemplates;
// (function(knownTemplates) {
//     knownTemplates.foregroundItemTemplate = "foregroundItemTemplate";
//     knownTemplates.containerItemTemplate = "containerItemTemplate";
// })(knownTemplates = exports.knownTemplates || (exports.knownTemplates = {}));
// var knownMultiTemplates;
// (function(knownMultiTemplates) {
//     knownMultiTemplates.foregroundItemTemplates = "foregroundItemTemplates";
//     knownMultiTemplates.containerItemTemplates = "containerItemTemplates";
// })(knownMultiTemplates = exports.knownMultiTemplates || (exports.knownMultiTemplates = {}));
var autoEffectiveRowHeight = -1;
var defaultFoldedRowHeight = 44;
var FoldingListViewBase = (function(_super) {
    __extends(FoldingListViewBase, _super);

    function FoldingListViewBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toggleMode = true;
        _this._itemIdGenerator = function(_item, index) { return index; };
        _this._itemTemplateSelectorBindable = new label_1.Label();
        _this._effectiveFoldedRowHeight = view_1.Length.toDevicePixels(defaultFoldedRowHeight, autoEffectiveRowHeight);
        _this._effectiveRowHeight = autoEffectiveRowHeight;
        _this._defaultTemplate = {
            key: "default",
            createView: function() {
                if (_this.itemTemplate) {
                    return builder_1.Builder.parse(_this.itemTemplate, _this);
                }
                return undefined;
            }
        };
        _this._itemTemplatesInternal = new Array(_this._defaultTemplate);
        _this._cellExpanded = new Array();
        _this._cachedDetailData = new Array();
        return _this;
    }
    Object.defineProperty(FoldingListViewBase.prototype, "separatorColor", {
        get: function() {
            return this.style.separatorColor;
        },
        set: function(value) {
            this.style.separatorColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FoldingListViewBase.prototype, "backViewColor", {
        get: function() {
            return this.style.backViewColor;
        },
        set: function(value) {
            this.style.backViewColor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FoldingListViewBase.prototype, "itemTemplateSelector", {
        get: function() {
            return this._itemTemplateSelector;
        },
        set: function(value) {
            var _this = this;
            if (typeof value === "string") {
                this._itemTemplateSelectorBindable.bind({
                    sourceProperty: null,
                    targetProperty: "templateKey",
                    expression: value
                });
                this._itemTemplateSelector = function(item, index, items) {
                    item["$index"] = index;
                    if (_this._itemTemplateSelectorBindable.bindingContext === item) {
                        _this._itemTemplateSelectorBindable.bindingContext = null;
                    }
                    _this._itemTemplateSelectorBindable.bindingContext = item;
                    return _this._itemTemplateSelectorBindable.get("templateKey");
                };
            } else if (typeof value === "function") {
                this._itemTemplateSelector = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FoldingListViewBase.prototype, "itemIdGenerator", {
        get: function() {
            return this._itemIdGenerator;
        },
        set: function(generatorFn) {
            this._itemIdGenerator = generatorFn;
        },
        enumerable: true,
        configurable: true
    });
    FoldingListViewBase.prototype.resetExpandedStates = function() {
        this._cachedDetailData = new Array();
        this._cellExpanded = new Array();
    };
    FoldingListViewBase.prototype.invalidateChachedDetailData = function(index) {
        this._setCachedDetailData(index, undefined);
    };
    FoldingListViewBase.prototype._getItemTemplate = function(index) {
        var templateKey = "default";
        if (this.itemTemplateSelector) {
            var dataItem = this._getDataItem(index);
            templateKey = this._itemTemplateSelector(dataItem, index, this.items);
        }
        for (var i = 0, length_1 = this._itemTemplatesInternal.length; i < length_1; i++) {
            if (this._itemTemplatesInternal[i].key === templateKey) {
                return this._itemTemplatesInternal[i];
            }
        }
        return this._itemTemplatesInternal[0];
    };
    FoldingListViewBase.prototype._getDetailDataLoaderPromise = function(index) {
        if (this.detailDataLoader) {
            return this.detailDataLoader(this._getDataItem(index), index);
        }
        return null;
    };
    FoldingListViewBase.prototype._prepareItem = function(item, index) {
        if (item) {
            item.bindingContext = this._getDataItem(index);
        }
    };
    FoldingListViewBase.prototype._onFoldedRowHeightPropertyChanged = function(oldValue, newValue) {
        this.refresh();
    };
    FoldingListViewBase.prototype._onItemsChanged = function(args) {
        this.refresh();
    };
    FoldingListViewBase.prototype.isItemAtIndexVisible = function(index) {
        return false;
    };
    FoldingListViewBase.prototype._getCachedDetailData = function(index) {
        return this._cachedDetailData[index];
    };
    FoldingListViewBase.prototype._setCachedDetailData = function(index, value) {
        this._cachedDetailData[index] = value;
    };
    FoldingListViewBase.prototype._getIsCellExpandedIn = function(index) {
        return this._cellExpanded[index];
    };
    FoldingListViewBase.prototype._setIsCellExpandedIn = function(index, value) {
        this._cellExpanded[index] = value;
    };
    FoldingListViewBase.prototype._getDataItem = function(index) {
        var thisItems = this.items;
        return thisItems.getItem ? thisItems.getItem(index) : thisItems[index];
    };
    FoldingListViewBase.prototype._getDefaultItemContent = function(index) {
        var lbl = new label_1.Label();
        lbl.bind({
            targetProperty: 'text',
            sourceProperty: '$value'
        });
        return lbl;
    };
    FoldingListViewBase.prototype._checkAndWrapProxyContainers = function(view) {
        if (view instanceof proxy_view_container_1.ProxyViewContainer) {
            var sp = new stack_layout_1.StackLayout();
            sp.addChild(view);
            return sp;
        }
        return view;
    };
    FoldingListViewBase.prototype.updateEffectiveFoldedRowHeight = function() {
        exports.foldedRowHeightProperty.coerce(this);
    };
    FoldingListViewBase.tapEvent = "tap";
    FoldingListViewBase.itemTapEvent = "itemTap";
    FoldingListViewBase.itemLoadingEvent = "itemLoading";
    FoldingListViewBase.loadMoreItemsEvent = "loadMoreItems";
    FoldingListViewBase.knownFunctions = ["itemTemplateSelector", "itemIdGenerator", "detailDataLoader"];
    FoldingListViewBase = __decorate([
        view_1.CSSType("FoldingListView")
    ], FoldingListViewBase);
    return FoldingListViewBase;
}(view_1.View));
exports.FoldingListViewBase = FoldingListViewBase;
FoldingListViewBase.prototype.recycleNativeView = "auto";
exports.itemsProperty = new view_1.Property({
    name: "items",
    valueChanged: function(target, oldValue, newValue) {
        if (oldValue instanceof observable_1.Observable) {
            weak_event_listener_1.removeWeakEventListener(oldValue, observable_array_1.ObservableArray.changeEvent, target._onItemsChanged, target);
        }
        if (newValue instanceof observable_1.Observable) {
            weak_event_listener_1.addWeakEventListener(newValue, observable_array_1.ObservableArray.changeEvent, target._onItemsChanged, target);
        }
        target.refresh();
    }
});
exports.itemsProperty.register(FoldingListViewBase);
exports.itemTemplateProperty = new view_1.Property({
    name: "itemTemplate",
    valueChanged: function(target) {
        target.refresh();
    }
});
exports.itemTemplateProperty.register(FoldingListViewBase);
exports.itemTemplatesProperty = new view_1.Property({
    name: "itemTemplates",
    valueConverter: function(value) {
        if (typeof value === "string") {
            return builder_1.Builder.parseMultipleTemplates(value);
        }
        return value;
    }
});
exports.itemTemplatesProperty.register(FoldingListViewBase);
exports.foldsCountProperty = new view_1.CoercibleProperty({
    name: "foldsCount",
    defaultValue: 3,
    coerceValue: function(target, value) {
        return value <= 2 ? 3 : value;
    },
    valueChanged: function(target, oldValue, newValue) {
        target.refresh();
    },
    valueConverter: function(v) { return +v; },
});
exports.foldsCountProperty.register(FoldingListViewBase);
exports.foldedRowHeightProperty = new view_1.CoercibleProperty({
    name: "foldedRowHeight",
    defaultValue: defaultFoldedRowHeight,
    equalityComparer: view_1.Length.equals,
    coerceValue: function(target, value) {
        return target.nativeViewProtected && value > 0 ? value : defaultFoldedRowHeight;
    },
    valueChanged: function(target, oldValue, newValue) {
        target._effectiveFoldedRowHeight = view_1.Length.toDevicePixels(newValue, autoEffectiveRowHeight);
        target._onFoldedRowHeightPropertyChanged(oldValue, newValue);
    },
    valueConverter: view_1.Length.parse
});
exports.foldedRowHeightProperty.register(FoldingListViewBase);
exports.backViewColorProperty = new view_1.CssProperty({
    name: "backViewColor",
    defaultValue: new view_1.Color("magenta"),
    cssName: "back-view-color",
    equalityComparer: view_1.Color.equals,
    valueConverter: function(v) { return new view_1.Color(v); },
});
exports.backViewColorProperty.register(view_1.Style);
exports.foldAnimationDurationProperty = new properties_1.Property({
    name: "foldAnimationDuration",
    defaultValue: 330,
    valueConverter: function(v) { return +v; },
    valueChanged: function(target, oldValue, newValue) {
        target.refresh();
    },
});
exports.foldAnimationDurationProperty.register(FoldingListViewBase);
exports.toggleModeProperty = new properties_1.Property({
    name: "toggleMode",
    defaultValue: true,
    valueConverter: view_1.booleanConverter,
});
exports.toggleModeProperty.register(FoldingListViewBase);
exports.separatorColorProperty = new view_1.CssProperty({ name: "separatorColor", cssName: "separator-color", equalityComparer: view_1.Color.equals, valueConverter: function(v) { return new view_1.Color(v); } });
exports.separatorColorProperty.register(view_1.Style);





var ForegroundViewCommom = (function(_super) {
    __extends(ForegroundViewCommom, _super);

    function ForegroundViewCommom() {

        var thiz = _super !== null && _super.apply(this, arguments) || this;
        return thiz;

    }
    ForegroundViewCommom = __decorate([
        layout_base_1.CSSType("ForegroundViewCommom")
    ], ForegroundViewCommom);
    return ForegroundViewCommom;
}(layout_base_1.LayoutBase));
exports.ForegroundViewCommom = ForegroundViewCommom;






var ContainerViewCommom = (function(_super) {
    __extends(ContainerViewCommom, _super);

    function ContainerViewCommom() {

        var thiz = _super !== null && _super.apply(this, arguments) || this;
        return thiz;

    }
    ContainerViewCommom = __decorate([
        layout_base_1.CSSType("ContainerViewCommom")
    ], ContainerViewCommom);
    return ContainerViewCommom;
}(layout_base_1.LayoutBase));
exports.ContainerViewCommom = ContainerViewCommom;






var FoldingViewCommom = (function(_super) {
    __extends(FoldingViewCommom, _super);

    function FoldingViewCommom() {

        var thiz = _super !== null && _super.apply(this, arguments) || this;
        return thiz;

    }
    FoldingViewCommom = __decorate([
        layout_base_1.CSSType("FoldingView")
    ], FoldingViewCommom);
    return FoldingViewCommom;
}(layout_base_1.LayoutBase));
exports.FoldingViewCommom = FoldingViewCommom;

var FoldingCellCommon = (function(_super) {
    __extends(FoldingCellCommon, _super);

    function FoldingCellCommon() {

        var thiz = _super !== null && _super.apply(this, arguments) || this;
        return thiz;

    }
    FoldingCellCommon = __decorate([
        layout_base_1.CSSType("FoldingCell")
    ], FoldingCellCommon);
    return FoldingCellCommon;
}(layout_base_1.LayoutBase));
exports.FoldingCellCommon = FoldingCellCommon;