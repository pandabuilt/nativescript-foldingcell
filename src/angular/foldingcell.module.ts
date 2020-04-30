import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FoldingListViewComponent } from './foldingcell.directive';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [FoldingListViewComponent],
    imports: [CommonModule],
    exports: [FoldingListViewComponent],
    schemas: [NO_ERRORS_SCHEMA]
})

export class FoldingListViewModule {
}