/// <reference path="hector.ts" />

module Revolution {
	
export interface RevolutionSamplerInterface {
	setup (params : any) : RevolutionSamplerInterface;
	sample () : Hector;
	reset (params? : any) : RevolutionSamplerInterface;
}

export class RevolutionSamplerDefault implements RevolutionSamplerInterface {
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
	
}