/// <reference path="demo-exportsdef.ts" />

module RevolutionDemo {

export var obst_list : Exports.ObstacleConfig[] = [
	// { name: 'obst1', type: 'default', agent_radius: 72 },
	// { name: 'obst2', type: 'circle', radius: 24, agent_radius: 24 },
	// { name: 'obst3', type: 'circle', radius: 12, agent_radius: 12 },
	{ name: 'obst4', type: 'circle', radius: 32, agent_radius: 32 },
	{ name: 'obst5', type: 'default', agent_radius: 96 }
];

export var config : Exports.Config = {
	game_size: new Phaser.Point(1024, 768),
	debug_draw: false,
	num_actor: 2, num_obst: 4,
	actor_radius: 20,
	canvas_id: 'demo-canvas'
};

}
