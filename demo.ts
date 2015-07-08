/// <reference path="typings/phaser/phaser.d.ts" />
/// <reference path="collections.ts" />

var game : Phaser.Game;
var debug : Phaser.Graphics;

var actors : Phaser.Group;
var obstacles : Phaser.Group;

type Point = Phaser.Point;

var obst_list : { name : string, type : string, radius? : number } [] = [
	{ name: 'obst1', type: 'default' },
	{ name: 'obst2', type: 'circle', radius: 24 },
	{ name: 'obst3', type: 'circle', radius: 12 },
	{ name: 'obst4', type: 'circle', radius: 32 },
	{ name: 'obst5', type: 'default' }
];

var config : {
	game_size : Point,
	debug_draw : boolean
	num_actor : number, num_obst : number
} = {
	game_size: new Phaser.Point(1024, 768),
	debug_draw: false,
	num_actor: 24, num_obst: 12
};

module RevUtil {
	export function random_pt(range : Point) : Point {
		return new Phaser.Point(Math.random() * range.x, Math.random() * range.y); }

	export function random_select<T>(source : T[]) : T {
		return source[Math.floor(Math.random() * source.length)]; }
}

module RevDebug {
	export function line(from : Point, to : Point, color : string) : void {
		game.debug.geom(new Phaser.Line(from.x, from.y, to.x, to.y), color); }
	
	export function line_to(org : Point, vec : Point, color : string) : void {
		line(org, Phaser.Point.add(org, vec), color); }
}

interface RevSelectable {
	on_select() : void;
	on_deselect() : void;
}

class RevSelectionMangaer {
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

var selection : RevSelectionMangaer;

class RevolutionSprite extends Phaser.Sprite implements RevSelectable {
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
	}
	
	on_select() { this.tint = 0xffaaaa; }
	
	on_deselect() { this.tint = 0xffffff; }
		
	toString() { return collections.makeString(this); }
}

class RevolutionObstacleObject extends RevolutionSprite {
	constructor(position : Point, image : string) {
		super(position, image);
	}
	
	add_to_world() : void {
		super.add_to_world();
		obstacles.addChild(this);
		this.body.kinematic = true;
	}
}

class RevolutionActor extends RevolutionSprite {
	
	is_moving : boolean;
	target : Point;
	max_speed : number;
	
	constructor(position : Point) {
		super(position, 'actor_body');
		this.max_speed = 72;
	}
	
	add_to_world() : void {
		super.add_to_world();
		actors.addChild(this);
	}
	
	move_to (target : Point) {
		this.is_moving = true;
		this.target = target;
	}
	
	update() {
		var vel : Point = new Phaser.Point(this.body.velocity.x, this.body.velocity.y);
		RevDebug.line_to(this.position, vel, 'white');
		
		if (this.is_moving) {
			if (Phaser.Point.distance(this.target, this.position) < 16) {
				this.is_moving = false;
				this.body.velocity.x = this.body.velocity.y = 0;
			} else {
				var force = Phaser.Point.add(this.target, Phaser.Point.negative(this.position));
				if (force.getMagnitude() > this.max_speed) { force.setMagnitude(this.max_speed); }
				force = Phaser.Point.add(force, Phaser.Point.negative(this.body.velocity));
				
				RevDebug.line_to(this.position, force, 'red');
				
				this.body.force.x = force.x, this.body.force.y = force.y;
			}
		}
	}
}

window.onload = function () {
	
	function preload () : void {
		game.load.image('test_image', '/assets/images/test_image.png');
		game.load.image('actor_body', '/assets/images/actor.png');
		
		game.load.image('obst1', '/assets/images/obst1.png');
		game.load.image('obst2', '/assets/images/obst2.png');
		game.load.image('obst3', '/assets/images/obst3.png');
		game.load.image('obst4', '/assets/images/obst4.png');
		game.load.image('obst5', '/assets/images/obst5.png');
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
						if (actor instanceof RevolutionActor) {
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
		
		selection = new RevSelectionMangaer();
		
		for (var i = 0; i < config.num_obst; i++) {
			var obst = RevUtil.random_select(obst_list);
			var obst_object = new RevolutionObstacleObject(RevUtil.random_pt(config.game_size), obst.name);
			obst_object.add_to_world();
			if (obst.type == 'circle') {
				obst_object.body.setCircle(obst.radius); }
		}
		for (var i = 0; i < config.num_actor; i++) {
			(new RevolutionActor(RevUtil.random_pt(config.game_size))).add_to_world(); }
		
	}
	
	game = new Phaser.Game(config.game_size.x, config.game_size.y, Phaser.AUTO, '', {
		preload: preload, create: create });
	
};
