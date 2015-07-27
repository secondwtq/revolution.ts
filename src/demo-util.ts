/// <reference path="../typings/phaser/phaser.d.ts" />

/// <reference path="demo.ts" />

module RevolutionDemo {

export module Utility {
	export function random_pt(range : Phaser.Point) : Phaser.Point {
		return new Phaser.Point(Math.random() * range.x, Math.random() * range.y); }

	export function random_select<T>(source : T[]) : T {
		return source[Math.floor(Math.random() * source.length)]; }
}

export module Debug {
	export function line(from : Phaser.Point, to : Phaser.Point, color : string) : void {
		game.debug.geom(new Phaser.Line(from.x, from.y, to.x, to.y), color); }
	
	export function line_to(org : Phaser.Point, vec : Phaser.Point, color : string) : void {
		line(org, Phaser.Point.add(org, vec), color); }
}

}
