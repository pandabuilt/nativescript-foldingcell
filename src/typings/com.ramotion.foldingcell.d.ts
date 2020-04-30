declare module com {
	export module ramotion {
		export module foldingcell {
			export class FoldingCell extends globalAndroid.widget.RelativeLayout {
				public static class: java.lang.Class<com.ramotion.foldingcell.FoldingCell>;
				public childDrawableStateChanged(param0: globalAndroid.view.View): void;
				public requestDisallowInterceptTouchEvent(param0: boolean): void;
				public startCollapseHeightAnimation(param0: java.util.ArrayList<java.lang.Integer>, param1: number): void;
				public requestChildFocus(param0: globalAndroid.view.View, param1: globalAndroid.view.View): void;
				public clearChildFocus(param0: globalAndroid.view.View): void;
				public onKeyDown(param0: number, param1: globalAndroid.view.KeyEvent): boolean;
				public updateViewLayout(param0: globalAndroid.view.View, param1: globalAndroid.view.ViewGroup.LayoutParams): void;
				public addView(param0: globalAndroid.view.View, param1: globalAndroid.view.ViewGroup.LayoutParams): void;
				public createContextMenu(param0: globalAndroid.view.ContextMenu): void;
				public constructor(param0: globalAndroid.content.Context, param1: globalAndroid.util.AttributeSet, param2: number, param3: number);
				public createImageViewFromBitmap(param0: globalAndroid.graphics.Bitmap): globalAndroid.widget.ImageView;
				public isLayoutRequested(): boolean;
				public sendAccessibilityEvent(param0: number): void;
				public onStartNestedScroll(param0: globalAndroid.view.View, param1: globalAndroid.view.View, param2: number): boolean;
				public focusSearch(param0: globalAndroid.view.View, param1: number): globalAndroid.view.View;
				public onKeyUp(param0: number, param1: globalAndroid.view.KeyEvent): boolean;
				public requestFitSystemWindows(): void;
				public getTextDirection(): number;
				public onKeyMultiple(param0: number, param1: number, param2: globalAndroid.view.KeyEvent): boolean;
				public measureViewAndGetBitmap(param0: globalAndroid.view.View, param1: number): globalAndroid.graphics.Bitmap;
				public unscheduleDrawable(param0: globalAndroid.graphics.drawable.Drawable, param1: java.lang.Runnable): void;
				public requestTransparentRegion(param0: globalAndroid.view.View): void;
				public invalidateChild(param0: globalAndroid.view.View, param1: globalAndroid.graphics.Rect): void;
				public startActionModeForChild(param0: globalAndroid.view.View, param1: globalAndroid.view.ActionMode.Callback): globalAndroid.view.ActionMode;
				public getChildVisibleRect(param0: globalAndroid.view.View, param1: globalAndroid.graphics.Rect, param2: globalAndroid.graphics.Point): boolean;
				public onNestedFling(param0: globalAndroid.view.View, param1: number, param2: number, param3: boolean): boolean;
				public toggle(param0: boolean): void;
				public createAndPrepareFoldingContainer(): globalAndroid.widget.LinearLayout;
				public constructor(param0: globalAndroid.content.Context, param1: globalAndroid.util.AttributeSet);
				public getTextAlignment(): number;
				public getParentForAccessibility(): globalAndroid.view.ViewParent;
				public prepareViewsForAnimation(param0: java.util.ArrayList<java.lang.Integer>, param1: globalAndroid.graphics.Bitmap, param2: globalAndroid.graphics.Bitmap): java.util.ArrayList<com.ramotion.foldingcell.views.FoldingCellView>;
				public createAnimationChain(param0: java.util.List<globalAndroid.view.animation.Animation>, param1: globalAndroid.view.View): void;
				public addView(param0: globalAndroid.view.View, param1: number): void;
				public startExpandHeightAnimation(param0: java.util.ArrayList<java.lang.Integer>, param1: number): void;
				public requestChildRectangleOnScreen(param0: globalAndroid.view.View, param1: globalAndroid.graphics.Rect, param2: boolean): boolean;
				public isTextDirectionResolved(): boolean;
				public onNestedPreFling(param0: globalAndroid.view.View, param1: number, param2: number): boolean;
				public onNestedPreScroll(param0: globalAndroid.view.View, param1: number, param2: number, param3: native.Array<number>): void;
				public calculateHeightsForAnimationParts(param0: number, param1: number, param2: number): java.util.ArrayList<java.lang.Integer>;
				public recomputeViewAttributes(param0: globalAndroid.view.View): void;
				public isLayoutDirectionResolved(): boolean;
				public addView(param0: globalAndroid.view.View, param1: number, param2: number): void;
				public isTextAlignmentResolved(): boolean;
				public onNestedScrollAccepted(param0: globalAndroid.view.View, param1: globalAndroid.view.View, param2: number): void;
				public notifySubtreeAccessibilityStateChanged(param0: globalAndroid.view.View, param1: globalAndroid.view.View, param2: number): void;
				public getLayoutDirection(): number;
				public constructor(param0: globalAndroid.content.Context, param1: globalAndroid.util.AttributeSet, param2: number);
				public removeView(param0: globalAndroid.view.View): void;
				public canResolveTextDirection(): boolean;
				public canResolveTextAlignment(): boolean;
				public initialize(animationDuration: number, backSideColor: number, additionalFlipsCount: number): void;
				public initialize(cameraHeight: number, animationDuration: number, backSideColor: number, additionalFlipsCount: number): void;
				public createBackSideView(param0: number): globalAndroid.widget.ImageView;
				public childHasTransientStateChanged(param0: globalAndroid.view.View, param1: boolean): void;
				public focusSearch(param0: number): globalAndroid.view.View;
				public showContextMenuForChild(param0: globalAndroid.view.View): boolean;
				public requestLayout(): void;
				public onKeyLongPress(param0: number, param1: globalAndroid.view.KeyEvent): boolean;
				public constructor(param0: globalAndroid.content.Context);
				public bringChildToFront(param0: globalAndroid.view.View): void;
				public startFoldAnimation(param0: java.util.ArrayList<com.ramotion.foldingcell.views.FoldingCellView>, param1: globalAndroid.view.ViewGroup, param2: number, param3: com.ramotion.foldingcell.animations.AnimationEndListener): void;
				public unscheduleDrawable(param0: globalAndroid.graphics.drawable.Drawable): void;
				public fold(param0: boolean): void;
				public isUnfolded(): boolean;
				public requestSendAccessibilityEvent(param0: globalAndroid.view.View, param1: globalAndroid.view.accessibility.AccessibilityEvent): boolean;
				public onNestedScroll(param0: globalAndroid.view.View, param1: number, param2: number, param3: number, param4: number): void;
				public setStateToFolded(): void;
				public focusableViewAvailable(param0: globalAndroid.view.View): void;
				public invalidateChildInParent(param0: native.Array<number>, param1: globalAndroid.graphics.Rect): globalAndroid.view.ViewParent;
				public canResolveLayoutDirection(): boolean;
				public addView(param0: globalAndroid.view.View): void;
				public invalidateDrawable(param0: globalAndroid.graphics.drawable.Drawable): void;
				public sendAccessibilityEventUnchecked(param0: globalAndroid.view.accessibility.AccessibilityEvent): void;
				public startUnfoldAnimation(param0: java.util.ArrayList<com.ramotion.foldingcell.views.FoldingCellView>, param1: globalAndroid.view.ViewGroup, param2: number, param3: com.ramotion.foldingcell.animations.AnimationEndListener): void;
				public scheduleDrawable(param0: globalAndroid.graphics.drawable.Drawable, param1: java.lang.Runnable, param2: number): void;
				public onStopNestedScroll(param0: globalAndroid.view.View): void;
				public unfold(param0: boolean): void;
				public getParent(): globalAndroid.view.ViewParent;
				public addView(param0: globalAndroid.view.View, param1: number, param2: globalAndroid.view.ViewGroup.LayoutParams): void;
			}
		}
	}
}