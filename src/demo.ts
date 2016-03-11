/// <reference path="../typings/phaser/phaser.d.ts" />
/// <reference path="../assets/external/collections.ts" />
/// <reference path="revolution.ts" />

/// <reference path="demo-config.ts" />
/// <reference path="demo-selection.ts" />
/// <reference path="demo-util.ts" />

module RevolutionDemo {

export var game : Phaser.Game;
var debug : Phaser.Graphics;

var actors : Phaser.Group;
var obstacles : Phaser.Group;

type Point = Phaser.Point;

var selection : Selection.Mangaer;
var revolution_m : Revolution.Manager;

class RevSprite extends Phaser.Sprite implements Selection.Selectable {
	
	agent : Revolution.RevolutionBasis;
	
	constructor(position : Point, name : string) {
		super(game, position.x, position.y, name);
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(0.5, 0.5);
		this.inputEnabled = true;
		this.input.priorityID = 1;
		
		this.events.onInputDown.add(() => {
			if (game.input.mouse.button == Phaser.Mouse.LEFT_BUTTON) {
				selection.select(this);
			} else { selection.deselect(this); }
		});
	}
	
	add_to_world() : void {
		game.physics.p2.enable(this, config.debug_draw);
		this.body.collideWorldBounds = true;
		revolution_m.add(this.agent);
	}
	
	on_select() { this.tint = 0xffaaaa; }
	
	on_deselect() { this.tint = 0xffffff; }
		
	toString() { return collections.makeString(this); }
}

class Obstacle extends RevSprite {
	
	agent : Revolution.Obstacle;
	
	constructor(position : Point, image : string, radius : number) {
		super(position, image);
		this.agent = new Revolution.Obstacle(radius, new Hector(position.x, position.y));
	}
	
	add_to_world() : void {
		super.add_to_world();
		obstacles.addChild(this);
		this.body.kinematic = true;
	}
}

class Actor extends RevSprite {
	
	target : Point;
	max_speed : number;
	agent : Revolution.Agent;
	
	constructor(position : Point) {
		super(position, 'actor_body');
		this.max_speed = 72;
		this.agent = new Revolution.Agent(config.actor_radius, new Hector(position.x, position.y));
		this.agent.max_speed = this.max_speed;
	}
	
	add_to_world() : void {
		super.add_to_world();
		actors.addChild(this);
		
		this.body.setCircle(14);
	}
	
	move_to (target : Point) {
		this.target = target;
		this.agent.is_moving = true;
	}
	
	update() {
		var vel : Point = new Phaser.Point(this.body.velocity.x, this.body.velocity.y);
		Debug.line_to(this.position, vel, 'white');
		
		this.agent.update(new Hector(this.position.x, this.position.y), new Hector(this.body.velocity.x, this.body.velocity.y));
		if (this.agent.is_moving) {
			if (Phaser.Point.distance(this.target, this.position) < 16) {
				this.agent.is_moving = false;
				this.body.velocity.x = this.body.velocity.y = 0;
			} else {
				var force = Phaser.Point.add(this.target, Phaser.Point.negative(this.position));
				if (force.getMagnitude() > this.max_speed) { force.setMagnitude(this.max_speed); }
				this.agent.desired(new Hector(force.x, force.y));
				force = Phaser.Point.add(force, Phaser.Point.negative(this.body.velocity));
				
				Debug.line_to(this.position, force, 'red');
				
				var nvh : Hector = this.agent.newVelocity();
				var nv_pt : Point = new Phaser.Point(nvh.x, nvh.y);
				Debug.line_to(this.position, nv_pt, 'green');
				
				var force_new = Hector.minus(nvh, new Hector(this.body.velocity.x, this.body.velocity.y));
				force = new Phaser.Point(force_new.x, force_new.y);
				
				this.body.force.x = force.x, this.body.force.y = force.y;
			}
		}
	}
}

window.onload = function () {
	
	function preload () : void {
		game.load.image('test_image', 'assets/images/test_image.png');
		game.load.image('actor_body', 'assets/images/actor.png');
		
		game.load.image('obst1', 'assets/images/obst1.png');
		game.load.image('obst2', 'assets/images/obst2.png');
		game.load.image('obst3', 'assets/images/obst3.png');
		game.load.image('obst4', 'assets/images/obst4.png');
		game.load.image('obst5', 'assets/images/obst5.png');
	}
	
	function create () : void {
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.restitution = 0.0;
		debug = game.add.graphics(0, 0);
		
		game.canvas.oncontextmenu = e => { e.preventDefault(); };
		
		var bg = game.add.sprite(0, 0);
		bg.fixedToCamera = true;
		bg.scale.setTo(game.width, game.height);
		bg.inputEnabled = true;
		bg.input.priorityID = 0;
		
		bg.events.onInputDown.add(() => {
			if (game.input.mouse.button === Phaser.Mouse.LEFT_BUTTON) {
				if (selection.select_mode()) {
					selection.selection().forEach(actor => {
						if (actor instanceof Actor) {
							actor.move_to(new Phaser.Point(game.input.x, game.input.y)); }
						return true;
					});
				} else {
					actors.forEachAlive(child => {
						child.move_to(new Phaser.Point(game.input.x, game.input.y)); }, this);
				}
			} else { selection.clear_selection(); }
		}, this);
		
		actors = game.add.group();
		actors.enableBody = true;
		obstacles = game.add.group();
		obstacles.enableBody = true;
		
		selection = new Selection.Mangaer();
		revolution_m = new Revolution.Manager();
		
		for (var i = 0; i < config.num_obst; i++) {
			var obst = Utility.random_select(obst_list);
			var obst_object = new Obstacle(Utility.random_pt(config.game_size),
					obst.name, obst.agent_radius);
			obst_object.add_to_world();
			if (obst.type == 'circle') {
				obst_object.body.setCircle(obst.radius); }
		}
		for (var i = 0; i < config.num_actor; i++) {
			(new Actor(Utility.random_pt(config.game_size))).add_to_world(); }
		
	}
	
	// game = new Phaser.Game(config.game_size.x, config.game_size.y, Phaser.AUTO, config.canvas_id, {
	// 	preload: preload, create: create }, false, true);
	game = new Phaser.Game({
		width: config.game_size.x, height: config.game_size.y,
		parent: config.canvas_id,
		state: { preload: preload, create: create },
		renderer: Phaser.AUTO,
		resolution: 1,
	});
	
};

}
