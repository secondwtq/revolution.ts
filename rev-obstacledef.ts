/// <reference path="hector.ts"/>

module Revolution {
export module Utility {

export class Segment {
	constructor(ep1 : Hector, ep2 : Hector) {
		this.construct(ep1, ep2); }
	
	construct(ep1 : Hector, ep2 : Hector) : Segment {
		this.endpoints = new Array<Hector>();
		this.endpoints.push(ep1.clone());
		this.endpoints.push(ep2.clone());
		return this;
	}
	
	public endpoints : Hector[];
}

export class Ray {
	
	constructor (private position : Hector, private velocity : Hector, public radius : number = 0) { }
	
	get pos() : Hector {
		return this.position; }
	
	get vel() : Hector {
		return this.velocity; }
		
	get direction() : Hector {
		return this.vel.nom(); }
}

export class IntersectTestResult {
	public time : number = 0;
	public time2 : number = 0;
	public result : boolean = false;;
	
	setTime(time : number) : IntersectTestResult {
		this.time = time;
		return this;
	}
	
	setTime2(time2 : number) :  IntersectTestResult {
		this.time2 = time2;
		return this;
	}
	
	setResult(result : boolean) : IntersectTestResult {
		this.result = result;
		return this;
	}
}

export class AgentLocalAvoidanceConf {
	max_speed : number;
	num_samples : number;
	safety_radius : number;
	
	weight_steer_cur : number;
	weight_steer_des : number;
	weight_time : number;
	weight_side : number;
}

}
}