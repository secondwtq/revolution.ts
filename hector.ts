
class Hector {

	constructor(public x : number = 0, public y : number = 0) { }
	
	plus(other : Hector | number) : Hector {
		if (typeof other === 'number') {
			return new Hector(this.x + other, this.y + other);
		} else { return new Hector(this.x + other.x, this.y + other.y); }
	}
	
	minus(other : Hector | number) : Hector {
		if (typeof other === 'number') {
			return new Hector(this.x - other, this.y - other);
		} else { return new Hector(this.x - other.x, this.y - other.y); }
	}
	
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
	
	length_sq() : number { return Math.pow(this.x, 2) + Math.pow(this.y, 2); }
	length() : number { return Math.sqrt((this.x * this.x) + (this.y * this.y)); }
	
}
