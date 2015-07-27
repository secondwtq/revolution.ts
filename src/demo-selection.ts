/// <reference path="../assets/external/collections.ts" />

module RevolutionDemo {
export module Selection {

export interface Selectable {
	on_select() : void;
	on_deselect() : void;
}

export class Mangaer {
	constructor() { }
	select_mode() : boolean { return !this.objects.isEmpty(); }
	
	clear_selection() : void {
		this.objects.forEach(element => {
			element.on_deselect(); return true; });
		this.objects.clear();
	}
	
	select(obj : Selectable) {
		this.objects.add(obj);
		obj.on_select();
	}
	
	deselect(obj : Selectable) {
		this.objects.remove(obj);
		obj.on_deselect();
	}
	
	selection() : collections.Set<Selectable> { return this.objects; }
	
	private objects : collections.Set<Selectable> = new collections.Set<Selectable>();
}

}
}
