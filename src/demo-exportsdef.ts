/// <reference path="../typings/phaser/phaser.d.ts" />

module RevolutionDemo {
export module Exports {

export interface ObstacleConfig {
	name : string,
	type : string,
	radius? : number,
	agent_radius : number
}

export interface Config {
	game_size : Phaser.Point,
	debug_draw : boolean
	num_actor : number, num_obst : number,
	actor_radius : number,
	canvas_id : string
}

}
}
