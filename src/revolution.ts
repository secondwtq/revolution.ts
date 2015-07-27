/// <reference path="hector.ts" />
/// <reference path="../assets/external/collections.ts" />

/// <reference path="rev-common.ts" />
/// <reference path="rev-sampler.ts" />
/// <reference path="rev-obstacledef.ts" />
/// <reference path="rev-obstacleavoid.ts" />

module Revolution {

export class Manager {
	objects : collections.Set<RevolutionBasis> = new collections.Set<RevolutionBasis>();
	
	private max_id : number = 0;
	
	add (obj : RevolutionBasis) : Manager {
		if (obj.parent !== undefined) {
			obj.parent.remove(obj); }
		obj.parent = this;
		this.assign_id(obj);
		this.objects.add(obj);
		return this;
	}
	
	remove (obj : RevolutionBasis) : Manager {
		obj.parent = undefined;
		this.objects.remove(obj);
		return this;
	}
	
	assign_id(src : RevolutionBasis) : Manager {
		src.id = this.max_id++;
		return this;
	}
}

export class RevolutionBasis {
	id : number = -1;
	vel : Hector = new Hector(0, 0);
	parent : Manager = undefined;
	constructor (public radius : number = 1, public pos : Hector = new Hector(0, 0)) { }
	type () : ObjectType { return ObjectType.BASIS; }
	toString () : string { return this.type().toString() + this.id; }
}

export class Agent extends RevolutionBasis {
	max_speed : number;
	num_samples : number;
	safety_radius : number;
	weight_steer_cur : number;
	weight_steer_des : number;
	weight_time : number;
	weight_side : number;
	
	is_moving : boolean;
	
	private desired_speed : Hector;
	// private dp : number;
	// private np : number;
	
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos);
		this.max_speed = 1;
		this.num_samples = 128;
		this.safety_radius = 1024;
		
		this.weight_steer_cur = 0.75;
		this.weight_time = 2.5;
		this.weight_steer_des = 2.0;
		this.weight_side = 0.75;
		
		this.is_moving = false;
		
		this.desired_speed = new Hector(0, 0);
	}
	type () : ObjectType { return ObjectType.AGENT; }
	
	desired(vel : Hector) { this.desired_speed = vel; }
	update(pos : Hector, vel : Hector) {
		this.pos = pos, this.vel = vel;
	}
	
	processSample(speed : Hector) : number {
		var side : number = 0;
		var nside : number = 0;	
		var min_time_to_coll : number = Utility.REVOLUTION_INF;
		
		if (this.parent) {
			this.parent.objects.forEach((obj : RevolutionBasis) => {
				if (obj !== this) {
					var time_to_coll : number = Utility.REVOLUTION_INF;
					// what is 'instanceof' EXECTLY is?
					// if (Hector.distance(obj.pos, this.pos) <= this.safety_radius) {
						
						var dpos = Hector.minus(obj.pos, this.pos).nom(); // dp
						var npos : Hector = new Hector(-dpos.y, dpos.x);
						var obj_desided_vel : Hector;
						if (obj instanceof Agent) {
							obj_desided_vel = obj.desired_speed;
						} else if (obj instanceof Obstacle) { obj_desided_vel = new Hector(); }
						var dvel : Hector = Hector.minus(obj_desided_vel, this.desired_speed); // dv
						var a : number = Hector.triArea(new Hector(0, 0), dpos, dvel);
						if (a <= 0.01) { npos = npos.multiply(-1); }
						
						var vel : Hector;
						if (obj instanceof Agent && obj.is_moving) {
							vel = Hector.minus(speed.multiply(2), Hector.plus(this.vel, obj.vel));
						} else { vel = speed; }
							
						side += Hector.clamp(Math.min(Hector.dot(dpos, vel) * 0.5 + 0.5, Hector.dot(npos, vel) * 2), 0, 1);
						nside++;

						var ray : Utility.Ray = new Utility.Ray(this.pos, vel, this.radius);
						var collresult : Utility.IntersectTestResult = Utility.intersectTestCircleCircle(ray, obj);
						if (!collresult.result) {
							return true;
						} else {
							if (collresult.time < 0 && collresult.time2 > 0) {
								collresult.setTime(-0.5 * collresult.time2); }
							if (collresult.time > 0) {
								if (collresult.time < min_time_to_coll) {
									min_time_to_coll = collresult.time; }
							}
						}
				}
				return true;
			}); /* for every object in the scene model */
		}
		if (nside) { side /= nside; }
		
		/*
		if (min_time_to_coll < REVOLUTION_INF) {
			RevolutionDemo.RevDebug.line_to(new Phaser.Point(this.pos.x, this.pos.y),
				new Phaser.Point(vel_sampled.x, vel_sampled.y), "blue");
		}
		*/
		
		var penalty_steer_cur = this.weight_steer_cur * (Hector.distance(speed, this.vel) / this.max_speed);
		var penalty_steer_des = this.weight_steer_des * (Hector.distance(speed, this.desired_speed) / this.max_speed);
		var penalty_time = this.weight_side * side;
		var penalty_side = this.weight_time * (0.01 + 1 / min_time_to_coll);
		return (penalty_steer_cur + penalty_steer_des + penalty_time + penalty_side);
	}
	
	newVelocity() : Hector {
		var penaltym : number = 100 * Utility.REVOLUTION_INF;
		var ret : Hector = new Hector(0, 0);
		
		var sampler : Sampler.Default = new Sampler.Default();
		sampler.setup({ max_speed: this.max_speed, desired: this.desired_speed, min_speed: this.max_speed / 2 });
		
		for (var i = 0; i < this.num_samples; i++) {
			var vel_sampled : Hector = sampler.sample();
			var penalty : number = this.processSample(vel_sampled);

			if (penalty < penaltym) {
				// console.log("sampling speed: ", vel_sampled.x, vel_sampled.y, " penalty ", penalty_steer_cur, penalty_steer_des, penalty_time, penalty_side);
				// console.log("sampling speed: ", vel_sampled.x, vel_sampled.y, " min_time_to_coll ", min_time_to_coll);
				penaltym = penalty;
				ret = vel_sampled;
			}
		} /* for every sample of velocity */
		
		return ret;
	}
}

export class Obstacle extends RevolutionBasis {
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos); }
	type () : ObjectType { return ObjectType.OBSTACLE; }
	
	obstacle_type () : ObstacleType { return this.obs_type; }
	private obs_type : ObstacleType = ObstacleType.CIRCLE;
	
	public segments : Utility.Segment[];
}

}
