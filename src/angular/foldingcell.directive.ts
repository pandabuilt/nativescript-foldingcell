import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    IterableDiffers
} from '@angular/core';

import { FoldingListView } from '../foldingcell';
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