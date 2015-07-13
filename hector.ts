
class Hector {

	constructor(public x : number = 0, public y : number = 0) { }
	
	plus(other : Hector | number) : Hector {
		if (typeof other === 'number') {
			return new Hector(this.x + other, this.y + other);
		} else { return new Hector(this.x + other.x, this.y + other.y); }
	}
	
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
	length() : number { return Hector.length(this); }
	distance(other : Hector) : number { return Hector.distance(this, other); }
	distance_sq(other : Hector) : number { return Hector.distance_sq(this, other); }
	
	static minus(lhs : Hector, rhs : Hector | number) : Hector {
		if (typeof rhs === 'number') {
			return new Hector(lhs.x - rhs, lhs.y - rhs);
		} else { return new Hector(lhs.x - rhs.x, lhs.y - rhs.y); }
	}
	
	static length(vec : Hector) : number { return Math.sqrt(vec.x * vec.x + vec.y * vec.y); }
	static length_sq(vec : Hector) : number { return Math.pow(vec.x, 2) + Math.pow(vec.y, 2); }
	static distance(lhs : Hector, rhs : Hector) : number { return Hector.length(Hector.minus(lhs, rhs)); }
	static distance_sq(lhs: Hector, rhs : Hector) : number { return Hector.length_sq(Hector.minus(lhs, rhs)); }
	
	
}
