/// <reference path="demo-exportsdef.ts" />

module RevolutionDemo {

export var obst_list : Exports.ObstacleConfig[] = [
	{ name: 'obst1', type: 'default', agent_radius: 36 },
	// { name: 'obst2', type: 'circle', radius: 24, agent_radius: 24 },
	{ name: 'obst3', type: 'default', agent_radius: 42 },
	{ name: 'obst4', type: 'circle', radius: 16, agent_radius: 16 },
	{ name: 'obst5', type: 'default', agent_radius: 16 }
];

export var config : Exports.Config = {
	game_size: new Phaser.Point(1024, 768),
	debug_draw: false,
	num_actor: 5, num_obst: 12,
	actor_radius: 20,
	canvas_id: 'demo-canvas'
};

}
