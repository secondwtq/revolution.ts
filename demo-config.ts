/// <reference path="typings/phaser/phaser.d.ts" />

module RevolutionDemo {

export var obst_list : { name : string, type : string, radius? : number, agent_radius : number } [] = [
	// { name: 'obst1', type: 'default', agent_radius: 72 },
	// { name: 'obst2', type: 'circle', radius: 24, agent_radius: 24 },
	// { name: 'obst3', type: 'circle', radius: 12, agent_radius: 12 },
	{ name: 'obst4', type: 'circle', radius: 32, agent_radius: 30 },
	// { name: 'obst5', type: 'default', agent_radius: 128 }
];

export var config : {
	game_size : Phaser.Point,
	debug_draw : boolean
	num_actor : number, num_obst : number,
	actor_radius : number,
	canvas_id : string
} = {
	game_size: new Phaser.Point(1024, 768),
	debug_draw: true,
	num_actor: 1, num_obst: 1,
	actor_radius: 16,
	canvas_id: 'demo-canvas'
};

}