/// <reference path="hector.ts" />
/// <reference path="collections.ts" />

/// <reference path="rev-common.ts" />
/// <reference path="rev-sampler.ts" />

module Revolution {

// the circle-circle collision inside RVOLIB (v1)
function get_time_to_coll(ray : RevolutionBasis, obj : RevolutionBasis, vel : Hector) : number {
	var pos_offset : Hector = Hector.minus(obj.pos, ray.pos);
	var agent_radsq : number = obj.radius * obj.radius;
	var time : number;
	
	var obs_cr : number = -1 * Math.pow(Hector.det(vel, pos_offset), 2) +
							agent_radsq * vel.length_sq();
	if (obs_cr > 0) {
		time = (Hector.dot(vel, pos_offset) - Math.sqrt(obs_cr)) / vel.length_sq();
		if (time < 0) { time = REVOLUTION_INF; }
	} else { time = REVOLUTION_INF; }
	return time;
}

// Detour's circle-circle collision
// which is better since it consider the radius of obj0
// and is under a better license
//	though I dont know how I did the Hector.dot() wrong ...
function get_time_to_coll_2(obj0 : RevolutionBasis, obj1 : RevolutionBasis, vel : Hector) : number {
	var pos_offset : Hector = Hector.minus(obj1.pos, obj0.pos);
	var r : number = obj0.radius + obj1.radius;
	var c : number = Hector.dot(pos_offset, pos_offset) - r * r;
	var a : number = Hector.dot(vel, vel);
	
	var b : number = Hector.dot(vel, pos_offset);
	var d : number = b * b - a * c;
	if (d < 0) return REVOLUTION_INF;
	a = 1 / a;
	var rd = Math.sqrt(d);
	var tmin = (b - rd) * a;
	var tmax = (b + rd) * a;
	if (tmin >= 0) {
		return tmin;
	} else { return REVOLUTION_INF; }
}

export class RevolutionManager {
	objects : collections.Set<RevolutionBasis> = new collections.Set<RevolutionBasis>();
	
	add (obj : RevolutionBasis) : RevolutionManager {
		if (obj.parent !== undefined) {
			obj.parent.remove(obj); }
		obj.parent = this;
		this.objects.add(obj);
		return this;
	}
	
	remove (obj : RevolutionBasis) : RevolutionManager {
		obj.parent = undefined;
		this.objects.remove(obj);
		return this;
	}
}

export class RevolutionBasis {
	vel : Hector = new Hector(0, 0);
	parent : RevolutionManager = undefined;
	constructor (public radius : number = 1, public pos : Hector = new Hector(0, 0)) { }
	type () : RevolutionObjectType { return RevolutionObjectType.BASIS; }
	toString () : string { return collections.makeString(this); }
}

export class RevolutionAgentLocalAvoidanceConf {
	max_speed : number;
	num_samples : number;
	safety_radius : number;
	
	weight_steer_cur : number;
	weight_steer_des : number;
	weight_time : number;
}

export class RevolutionAgent extends RevolutionBasis {
	max_speed : number;
	num_samples : number;
	safety_radius : number;
	weight_steer_cur : number;
	weight_steer_des : number;
	weight_time : number;
	
	private desired_speed : Hector;
	
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos);
		this.max_speed = 1;
		this.num_samples = 256;
		this.safety_radius = 640;
		this.weight_steer_cur = 0.75;
		this.weight_time = 2.5;
		this.weight_steer_des = 2.0;
		
		this.desired_speed = new Hector(0, 0);
	}
	type () : RevolutionObjectType { return RevolutionObjectType.AGENT; }
	
	desired(vel : Hector) { this.desired_speed = vel; }
	update(pos : Hector, vel : Hector) {
		this.pos = pos, this.vel = vel;
	}
	
	new_velocity() : Hector {
		
		var penaltym : number = REVOLUTION_INF;
		var ret : Hector = new Hector(0, 0);
		
		var sampler : RevolutionSamplerDefault = new RevolutionSamplerDefault();
		sampler.setup({ max_speed: this.max_speed, desired: this.desired_speed });
		
		for (var i = 0; i < this.num_samples; i++) {
			var vel_sampled : Hector = sampler.sample();
			
			var penalty_steer_cur = this.weight_steer_cur * (Hector.distance(vel_sampled, this.vel) / this.max_speed);
			var penalty_steer_des = this.weight_steer_des * (Hector.distance(vel_sampled, this.desired_speed) / this.max_speed);
			var penalty_time = 0;
			var penalty_side = 0;
			
			var side : number = 0;
			var nside : number = 0;
			
			var min_time_to_coll : number = REVOLUTION_INF;
			if (this.parent) {
				this.parent.objects.forEach((obj : RevolutionBasis) => {
					var time_to_coll : number = REVOLUTION_INF;
					nside++;
					// what is 'instanceof' EXECTLY is?
					if (Hector.distance(obj.pos, this.pos) <= this.safety_radius) {
						if (obj instanceof RevolutionAgent) {
							var vel : Hector = Hector.minus(vel_sampled.multiply(2), Hector.plus(this.vel, obj.vel));
							time_to_coll = get_time_to_coll_2(this, obj, vel);
						} else if (obj instanceof RevolutionObstacle) {
							time_to_coll = get_time_to_coll_2(this, obj, vel_sampled);
						}
					}
					
					if (time_to_coll < min_time_to_coll) {
						min_time_to_coll = time_to_coll;
						// if (1 / min_time_to_coll >= penaltym) {
						// 	return false; }
					}
					return true;
				});
			}
			
			if (min_time_to_coll !== REVOLUTION_INF) {
				// RevolutionDemo.RevDebug.line_to(new Phaser.Point(this.pos.x, this.pos.y),
				// 	new Phaser.Point(vel_sampled.x, vel_sampled.y), "blue");
			}
			
			penalty_time = this.weight_time * (1 / min_time_to_coll);
			var penalty : number = penalty_steer_cur + penalty_steer_des + penalty_time + penalty_side;
			// console.log("sampling speed: ", vel_sampled.x, vel_sampled.y, " penalty ", penalty);
			if (penalty < penaltym) {
				// console.log("sampling speed: ", vel_sampled.x, vel_sampled.y, " min_time_to_coll ", min_time_to_coll);
				penaltym = penalty;
				ret = vel_sampled;
			}
		} // for every sample of velocity
		
		return ret;
	}
}

export class RevolutionObstacle extends RevolutionBasis {
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos); }
	type () : RevolutionObjectType { return RevolutionObjectType.OBSTACLE; }
}

}
