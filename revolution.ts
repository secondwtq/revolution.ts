/// <reference path="hector.ts" />

class RevolutionBasis {
	vel : Hector = new Hector(0, 0);
	constructor (public radius : number = 1, public pos : Hector = new Hector(0, 0)) { }
}

class RevolutionSampler {
	constructor () { }
	
	setup (params : any) : RevolutionSampler { return this; }
	sample () : Hector { return new Hector(0, 0); }
}

class RevolutionSamplerDefault extends RevolutionSampler {
	constructor () {
		super();
	}
	
	setup (params : { max_speed : number }) : RevolutionSamplerDefault {
		this.max_speed = params.max_speed;
		return this;
	}
	
	sample () : Hector {
		var ret : Hector = new Hector();
		do {
			ret.reset(2 * Math.random() - 1, 2 * Math.random() - 1);
		} while (ret.length_sq() > 1);
		return ret.multiplyS(this.max_speed);
	}
	
	private max_speed : number;
}

class RevolutionManager {
	
}

class RevolutionAgent extends RevolutionBasis {
	max_speed : number;
	samples : number;
	
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos);
		this.max_speed = 1;
		this.samples = 128;
	}
}

class RevolutionObstacle extends RevolutionBasis {
	constructor(radius : number = 1, pos : Hector = new Hector(0, 0)) {
		super(radius, pos); }
}
