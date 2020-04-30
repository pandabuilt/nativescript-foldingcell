declare const enum AnimationType {
	Open = 0,
	Close = 1
}

declare class FoldingCell extends UITableViewCell {

	static alloc(): FoldingCell; 
	static appearance(): FoldingCell; 
	static appearanceForTraitCollection(trait: UITraitCollection): FoldingCell;
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): FoldingCell; 
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): FoldingCell; 
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): FoldingCell; 
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): FoldingCell;
	static new(): FoldingCell;

	backViewColor: UIColor;
	containerView: UIView;
	containerViewTop: NSLayoutConstraint;
	durationsForCollapsedState: NSArray<number>;
	durationsForExpandedState: NSArray<number>;
	foregroundView: RotatedView;
	foregroundViewTop: NSLayoutConstraint;
	isUnfolded: boolean;
	itemCount: number;

	animationDurationType(itemIndex: number, type: AnimationType): number;
	commonInit(): void;
	isAnimating(): boolean;
	unfoldAnimatedCompletion(value: boolean, animated: boolean, completion: () => void): void;
	class(): typeof NSObject;

}


declare var FoldingCellVersionNumber: number;

declare var FoldingCellVersionString: interop.Reference<number>;

declare class RotatedView extends UIView implements CAAnimationDelegate {

	static alloc(): RotatedView; 
	static appearance(): RotatedView;
	static appearanceForTraitCollection(trait: UITraitCollection): RotatedView; 
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): RotatedView; 
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): RotatedView; 
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): RotatedView; 
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): RotatedView; 
	static new(): RotatedView;

	animationDidStart(anim: CAAnimation): void;
	animationDidStopFinished(anim: CAAnimation, flag: boolean): void;
	class(): typeof NSObject;
	conformsToProtocol(aProtocol: any /* Protocol */): boolean;
	isEqual(object: any): boolean;
	isKindOfClass(aClass: typeof NSObject): boolean;
	isMemberOfClass(aClass: typeof NSObject): boolean;
	performSelector(aSelector: string): any;
	performSelectorWithObject(aSelector: string, object: any): any;
	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;
	respondsToSelector(aSelector: string): boolean;
	retainCount(): number;
	self(): this;
}