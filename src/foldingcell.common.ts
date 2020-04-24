import { KeyedTemplate, isIOS } from '@nativescript/core/ui/core/view';
import { Template } from '@nativescript/core/ui/core/view';
import { Length } from '@nativescript/core/ui/core/view';
import { ObservableArray, ChangedData } from '@nativescript/core/data/observable-array';
import { Observable } from 'tns-core-modules/data/observable';
import { View, CSSType, Property } from '@nativescript/core/ui/core/view';
import { CoercibleProperty, CssProperty, Color, Style } from '@nativescript/core/ui/core/view';
import { booleanConverter } from 'tns-core-modules/ui/core/view/view';
import { Label, StackLayout, ProxyViewContainer } from '@nativescript/core/ui';
import { addWeakEventListener, removeWeakEventListener } from '@nativescript/core/ui/core/weak-event-listener';
import { Builder } from '@nativescript/core';

export const autoEffectiveRowHeight = -1;
export const defaultFoldedRowHeight = 44;

export const TAP = "tap";
export const ITEMTAP = "itemTap";
export const ITEMLOADING = 'itemLoading';
export const LOADMOREITEMS = 'loadMoreItems';

export namespace knownTemplates {
    export const itemTemplate = 'itemTemplate';
}

export namespace knownMultiTemplates {
    export const itemTemplates = 'itemTemplates';
}

export interface ItemsSource {
    length: number;
    getItem(index: number): any;
}

@CSSType('FoldingListView')
export abstract class FoldingListViewBase extends View {


    public static tapEvent = TAP;
    public static itemTapEvent = ITEMTAP;
    public static itemLoadingEvent = ITEMLOADING;
    public static loadMoreItemsEvent = LOADMOREITEMS;
    public static knownFunctions = ["itemTemplateSelector", "itemIdGenerator", "detailDataLoader"];

    private _itemTemplateSelector: (item: any, index: number, items: any) => string;
    private _itemIdGenerator: (item: any, index: number, items: any) => number = (_item: any, index: number) => index;
    public detailDataLoader: (item: any, index: number) => Promise<any>;

    public items: any[] | ItemsSource;
    public itemTemplate: string | Template;
    public itemTemplates: string | Array<KeyedTemplate>;
    public toggleMode: boolean;
    public foldsCount: number;
    public foldedRowHeight: Length;
    public foldAnimationDuration: number;

    _itemTemplateSelectorBindable: Label;
    _effectiveFoldedRowHeight: number;
    _effectiveRowHeight: number;
    _itemTemplatesInternal: Array<KeyedTemplate>;
    _cellExpanded: Array<boolean>;
    _cachedDetailData: Array<any>;
    _defaultTemplate: KeyedTemplate;

    public abstract refresh(): void;
    public abstract scrollToIndex(index: number, animated?: boolean);
    public abstract isItemAtIndexVisible(index: number): boolean;

    constructor() {
        super();

        this._defaultTemplate = {
            key: "default",
            createView: () => {
                if (this.itemTemplate) {
                    return Builder.parse(this.itemTemplate, this);
                }
                return undefined;
            }
        };

        this.toggleMode = true;
        this._itemTemplateSelectorBindable = new Label();
        this._effectiveFoldedRowHeight = Length.toDevicePixels(defaultFoldedRowHeight, autoEffectiveRowHeight);
        this._effectiveRowHeight = autoEffectiveRowHeight;
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        this._cellExpanded = new Array();
        this._cachedDetailData = new Array();
    }

    public get separatorColor(): Color {
        return this.style.separatorColor;
    }

    public set separatorColor(value: Color) {
        this.style.separatorColor = value;
    }

    public get backViewColor(): Color {
        return (this.style as any).backViewColor;
    }
    public set backViewColor(value: Color) {
        (this.style as any).backViewColor = value;
    }

    public get itemIdGenerator(): (item: any, index: number, items: any) => number {
        return this._itemIdGenerator;
    }

    public set itemIdGenerator(generatorFn: (item: any, index: number, items: any) => number) {
        this._itemIdGenerator = generatorFn;
    }

    public get itemTemplateSelector(): | string | ((item: any, index: number, items: any) => string) {
        return this._itemTemplateSelector;
    }

    public set itemTemplateSelector(value: string | ((item: any, index: number, items: any) => string)) {
        if (typeof value === 'string') {
            this._itemTemplateSelectorBindable.bind({
                sourceProperty: null,
                targetProperty: 'templateKey',
                expression: value
            });
            this._itemTemplateSelector = (item: any, index: number, items: any) => {
                item['$index'] = index;
                if (this._itemTemplateSelectorBindable.bindingContext === item) {
                    this._itemTemplateSelectorBindable.bindingContext = null;
                }
                this._itemTemplateSelectorBindable.bindingContext = item;
                return this._itemTemplateSelectorBindable.get('templateKey');
            };
        } else if (typeof value === 'function') {
            this._itemTemplateSelector = value;
        }
    }

    public resetExpandedStates() {
        this._cachedDetailData = new Array<any>();
        this._cellExpanded = new Array<boolean>();
    }

    public invalidateChachedDetailData(index: number) {
        this._setCachedDetailData(index, undefined);
    };

    public _getItemTemplate(index: number): KeyedTemplate {
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

    public _getDetailDataLoaderPromise(index: number): Promise<any> {
        if (this.detailDataLoader) {
            return this.detailDataLoader(this._getDataItem(index), index);
        }
        return null;
    };

    public _prepareItem(item: View, index: number) {
        if (item) {
            item.bindingContext = this._getDataItem(index);
        }
    };

    public _onFoldedRowHeightPropertyChanged(oldValue: Length, newValue: Length) {
        this.refresh();
    };

    public _onItemsChanged(args: ChangedData<any>) {
        this.refresh();
    };

    public _getCachedDetailData(index: number) {
        return this._cachedDetailData[index];
    };

    public _setCachedDetailData(index: number, value) {
        this._cachedDetailData[index] = value;
    };

    public _getIsCellExpandedIn(index): boolean {
        return this._cellExpanded[index];
    };

    public _setIsCellExpandedIn(index: number, value: boolean) {
        this._cellExpanded[index] = value;
    };

    public _getDataItem(index: number) {
        var thisItems = this.items as ItemsSource;
        return thisItems.getItem ? thisItems.getItem(index) : thisItems[index];
    };

    public _getDefaultItemContent(index: number): View {
        var lbl = new Label();
        lbl.bind({
            targetProperty: 'text',
            sourceProperty: '$value'
        });
        return lbl;
    };

    public _checkAndWrapProxyContainers(view: View): View {
        if (view instanceof ProxyViewContainer) {
            var sp = new StackLayout();
            sp.addChild(view);
            return sp;
        }
        return view;
    };

    protected updateEffectiveFoldedRowHeight() {
        foldedRowHeightProperty.coerce(this);
    };

}

function onItemsChanged(target: FoldingListViewBase, oldValue, newValue) {
    if (oldValue instanceof Observable) {
        removeWeakEventListener(
            oldValue,
            ObservableArray.changeEvent,
            target._onItemsChanged,
            target
        );
    }

    if (newValue instanceof Observable && !(newValue instanceof ObservableArray)) {
        addWeakEventListener(
            newValue,
            ObservableArray.changeEvent,
            target._onItemsChanged,
            target
        );
    }
    target.refresh();
}

export const itemsProperty = new Property<FoldingListViewBase, any[] | ItemsSource>({
    name: 'items',
    affectsLayout: true,
    valueChanged: onItemsChanged
});
itemsProperty.register(FoldingListViewBase);

export const itemTemplateProperty = new Property<FoldingListViewBase, string | Template>({
    name: 'itemTemplate',
    affectsLayout: true,
    valueChanged: target => {
        target.refresh();
    }
});
itemTemplateProperty.register(FoldingListViewBase);

export const itemTemplatesProperty = new Property<FoldingListViewBase, string | Array<KeyedTemplate>>({
    name: 'itemTemplates',
    affectsLayout: true,
    valueConverter: value => {
        if (typeof value === 'string') {
            return Builder.parseMultipleTemplates(value);
        }
        return value;
    }
});
itemTemplatesProperty.register(FoldingListViewBase);


var defaultFoldCounts;
export var foldsCountProperty;

if (isIOS) {
    defaultFoldCounts = 3;
    foldsCountProperty = new CoercibleProperty<FoldingListViewBase, number>({
        name: "foldsCount",
        defaultValue: defaultFoldCounts,
        coerceValue: function (target, value) {
            return value <= 2 ? 3 : value;
        },
        valueChanged: function (target: FoldingListViewBase, oldValue, newValue) {
            target.refresh();
        },
        valueConverter: (v) => { return +v; },
    });
    foldsCountProperty.register(FoldingListViewBase);
} else {
    defaultFoldCounts = 2;
    foldsCountProperty = new CoercibleProperty<FoldingListViewBase, number>({
        name: "foldsCount",
        defaultValue: defaultFoldCounts,
        coerceValue: function (target, value) {
            return value <= 2 ? 2 : value;
        },
        valueChanged: (target: FoldingListViewBase, oldValue, newValue) => {
            target.refresh();
        },
        valueConverter: (v) => { return +v; },
    });
    foldsCountProperty.register(FoldingListViewBase);
}

export const foldedRowHeightProperty = new CoercibleProperty<FoldingListViewBase, Length>({
    name: "foldedRowHeight",
    defaultValue: defaultFoldedRowHeight,
    equalityComparer: Length.equals,
    coerceValue: (target: FoldingListViewBase, value) => {
        return target.nativeViewProtected && value > 0 ? value : defaultFoldedRowHeight;
    },
    valueChanged: (target: FoldingListViewBase, oldValue, newValue) => {
        target._effectiveFoldedRowHeight = Length.toDevicePixels(newValue, autoEffectiveRowHeight);
        target._onFoldedRowHeightPropertyChanged(oldValue, newValue);
    },
    valueConverter: Length.parse
});
foldedRowHeightProperty.register(FoldingListViewBase);

export const backViewColorProperty = new CssProperty<Style, Color>({
    name: "backViewColor",
    defaultValue: new Color("magenta"),
    cssName: "back-view-color",
    equalityComparer: Color.equals,
    valueConverter: v => { return new Color(v); }
});
backViewColorProperty.register(Style);

export const separatorColorProperty = new CssProperty({
    name: "separatorColor",
    defaultValue: new Color("gray"),
    cssName: "separator-color",
    equalityComparer: Color.equals,
    valueConverter: v => { return new Color(v); }
});
separatorColorProperty.register(Style);

export const foldAnimationDurationProperty = new Property<FoldingListViewBase, number>({
    name: "foldAnimationDuration",
    defaultValue: 330,
    valueConverter: v => { return +v; },
    valueChanged: (target: FoldingListViewBase, oldValue, newValue) => {
        target.refresh();
    },
});
foldAnimationDurationProperty.register(FoldingListViewBase);

export const toggleModeProperty = new Property<FoldingListViewBase, boolean>({
    name: "toggleMode",
    defaultValue: true,
    valueConverter: booleanConverter,
});
toggleModeProperty.register(FoldingListViewBase);
