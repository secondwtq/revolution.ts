/// <reference path="hector.ts" />
/// <reference path="rev-obstacledef.ts" />
/// <reference path="revolution.ts" />

module Revolution {
export module Utility {
	
export function intersectTestCircleCircle(ray : Ray, obs : RevolutionBasis) : IntersectTestResult {
	var pos_offset : Hector = Hector.minus(obs.pos, ray.pos);
	var radius_total = ray.radius + obs.radius;
	var c : number = Hector.dot(pos_offset, pos_offset) - Math.pow(radius_total, 2);
	var a : number = Hector.dot(ray.vel, ray.vel);
	var b : number = Hector.dot(ray.vel, pos_offset);
	var d : number = Math.pow(b, 2) - a * c;
	
	var result : IntersectTestResult = new IntersectTestResult();
	if (d < 0) {
		return result.setTime(0).setResult(false); }
	a = 1 / a;
	return result.setTime((b - Math.sqrt(d)) * a).
		setTime2((b + Math.sqrt(d)) * a).setResult(true);
}

function intersectTestRaySegment(ray : Ray, segment : Segment) : IntersectTestResult {
	var v : Hector = Hector.minus(segment.endpoints[1], segment.endpoints[0]);
	var w : Hector = Hector.minus(ray.pos, segment.endpoints[0]);
	var d : number = Hector.det(ray.vel, v);
	
	var result : IntersectTestResult = new IntersectTestResult();
	if (Math.abs(d) < 1e-6) {
		return result.setTime(0).setResult(false); }

	d = 1 / d;
	result.time = Hector.det(v, w) * d;
	if (result.time < 0 || result.time > 1) {
		return result.setResult(false);
	} else {
		var s : number = Hector.det(ray.vel, w) * d;
		if (s < 0 || s > 1) {
			return result.setResult(false); }
	}
	
	return result.setResult(true);
}

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

}
}
