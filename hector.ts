
class Hector {

	constructor(public x : number = 0, public y : number = 0) { }
	
	plus(other : Hector | number) : Hector { return Hector.plus(this, other); }
	minus(other : Hector | number) : Hector { return Hector.minus(this, other); }
	
	divide(other : number) : Hector {
		return new Hector(this.x / other, this.y / other); }
		
	multiply(other : number) : Hector {
		return new Hector(this.x * other, this.y * other); }
	multiplyS(other : number) : Hector {
		this.x *= other, this.y *= other;
		return this;
	}
		
	reset(x : number, y : number) : Hector {
		this.x = x, this.y = y;
		return this;
	}
	
	length_sq() : number { return Hector.length_sq(this); }
	len() : number { return Hector.len(this); }
	distance(other : Hector) : number { return Hector.distance(this, other); }
	distance_sq(other : Hector) : number { return Hector.distance_sq(this, other); }
	
	nom() : Hector { return this.divide(this.len()); }
	
	flip() : Hector { return Hector.flip(this); }
	
	static plus(lhs : Hector, rhs : Hector | number) : Hector {
		if (typeof rhs === 'number') {
			return new Hector(lhs.x + rhs, lhs.y + rhs);
		} else { return new Hector(lhs.x + rhs.x, lhs.y + rhs.y); }
	}
	
	static minus(lhs : Hector, rhs : Hector | number) : Hector {
		if (typeof rhs === 'number') {
			return new Hector(lhs.x - rhs, lhs.y - rhs);
		} else { return new Hector(lhs.x - rhs.x, lhs.y - rhs.y); }
	}
	
	static len(vec : Hector) : number { return Math.sqrt(vec.x * vec.x + vec.y * vec.y); }
	static length_sq(vec : Hector) : number { return Math.pow(vec.x, 2) + Math.pow(vec.y, 2); }
	static distance(lhs : Hector, rhs : Hector) : number { return Hector.len(Hector.minus(lhs, rhs)); }
	static distance_sq(lhs: Hector, rhs : Hector) : number { return Hector.length_sq(Hector.minus(lhs, rhs)); }
	static det(lhs : Hector, rhs : Hector) : number { return ((lhs.x * rhs.y) - (lhs.y * rhs.x)); }
	static dot(lhs : Hector, rhs : Hector) : number { return ((lhs.x * rhs.x) + (lhs.y * rhs.y)); }
	
	static flip(src : Hector) : Hector { return new Hector(src.y, src.x); }
	
	static clamp(src : number, min : number, max : number) : number {
		if (src < min) { return min; }
		else if (src > max) { return max; }
		else { return src; }
	}
	
	static triArea(a : Hector, b : Hector, c : Hector) : number {
		var abx : number = b.x - a.x;
		var aby : number = b.y - a.y;
		var acx : number = c.x - a.x;
		var acy : number = c.y - a.y;
		return acx * aby - abx * acy;
		
		/*
		var ab : Hector = Hector.minus(b, a);
		var ac : Hector = Hector.minus(c, a);
		return Hector.det(ab, ac);
		*/
	}
	
}
