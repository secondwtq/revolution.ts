/// <reference path="collections.ts" />

module RevolutionDemo {

export interface RevSelectable {
	on_select() : void;
	on_deselect() : void;
}

export class RevSelectionMangaer {
	constructor() { }
	select_mode() : boolean { return !this.objects.isEmpty(); }
	
	clear_selection() : void {
		this.objects.forEach(element => {
			element.on_deselect(); return true; });
		this.objects.clear();
	}
	
	select(obj : RevSelectable) {
		this.objects.add(obj);
		obj.on_select();
	}
	
	deselect(obj : RevSelectable) {
		this.objects.remove(obj);
		obj.on_deselect();
	}
	
	selection() : collections.Set<RevSelectable> { return this.objects; }
	
	private objects : collections.Set<RevSelectable> = new collections.Set<RevSelectable>();
}

}
