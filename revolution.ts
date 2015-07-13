/// <reference path="hector.ts" />
/// <reference path="collections.ts" />

enum RevolutionObjectType {
	BASIS, AGENT, OBSTACLE }

const REVOLUTION_INF : number = 19961208;

class RevolutionBasis {
	vel : Hector = new Hector(0, 0);
	parent : RevolutionManager = undefined;
	constructor (public radius : number = 1, public pos : Hector = new Hector(0, 0)) { }
	type () : RevolutionObjectType { return RevolutionObjectType.BASIS; }
	toString () : string { return collections.makeString(this); }
}

class RevolutionManager {
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

interface RevolutionSamplerInterface {
	setup (params : any) : RevolutionSamplerInterface;
	sample () : Hector;
	reset (params? : any) : RevolutionSamplerInterface;
}

class RevolutionSamplerDefault implements RevolutionSamplerInterface {
	constructor () { }
	
	setup (params : { max_speed : number, desired : Hector }) : RevolutionSamplerInterface {
		return this.reset(params); }
	
	sample () : Hector {
		var ret : Hector = new Hector();
		this.sample_idx++;
		if (this.sample_idx === 1) {
			return this.desired_speed; }
		do {
			ret.reset(2 * Math.random() - 1, 2 * Math.random() - 1);
		} while (ret.length_sq() > 1);
		return ret.multiplyS(this.max_speed);
	}
	
	reset (params? : { max_speed : number, desired : Hector }) : RevolutionSamplerInterface {
		if (params) {
			this.max_speed = params.max_speed;
			this.desired_speed = params.desired;
		}
		this.sample_idx = 0;
		return this;
	}
	
	private desired_speed : Hector;
	private max_speed : number;
	private sample_idx : number;
}

class RevolutionAgent extends RevolutionBasis {
	max_speed : number;
	samples : number;
	safety_radius : number;
	
	private desired_speed : Hector;
	
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos);
		this.max_speed = 1;
		this.samples = 128;
		this.safety_radius = 384;
		
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
		
		for (var i = 0; i < this.samples; i++) {
			var vel_sampled : Hector = sampler.sample();
			var velocity_offset = Hector.distance(vel_sampled, this.desired_speed);
			
			var min_time_to_coll : number = REVOLUTION_INF;
			if (this.parent) {
				this.parent.objects.forEach((obj : RevolutionBasis) => {
					var time_to_coll : number = REVOLUTION_INF;
					// what is 'instanceof' EXECTLY is?
					if (obj instanceof RevolutionAgent) {
						
					} else if (obj instanceof RevolutionObstacle) {
						
					}
					
					if (time_to_coll < min_time_to_coll) {
						min_time_to_coll = time_to_coll;
						if (min_time_to_coll + velocity_offset >= penaltym) {
							return false; }
					}
					return true;
				});
			}
			
			var penalty : number = min_time_to_coll + velocity_offset;
			if (penalty < penaltym) {
				penaltym = penalty;
				ret = vel_sampled;
			}
		}
		
		return ret;
	}
}

class RevolutionObstacle extends RevolutionBasis {
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos); }
	type () : RevolutionObjectType { return RevolutionObjectType.OBSTACLE; }
}
