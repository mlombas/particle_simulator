const MASSTORADIUSRATIO = .5;
const K = 9e9; //Electrical constant, rounded

const ARROWHEADLEN = 20; //The length of the arrowhead, in pixels, also used in the box
                         //For drawing purposes

class Vector extends Drawable {
   constructor(x, y) {
      super();

      this.x = x;
      this.y = y;
   }

   static zero() {
      return new Vector(0, 0);
   }
   static one() {
      return new Vector(1, 1);
   }

   add(another) {
      return new Vector(this.x + another.x, this.y + another.y);
   }
   sub(another) {
      return this.add(another.negate());
   }
   mult(scalar) {
      return new Vector(scalar * this.x, scalar * this.y);
   }
   div(scalar) {
      return this.mult(1/scalar);
   }

   negate() {
      return new Vector(-this.x, -this.y);
   }

   normalized() {
      return this.div(this.length);
   }

   dot(another) {
      return this.x * another.x + this.y * another.y;
   }

   get lengthSq() {
      return this.dot(this);
   }
   get length() {
      return this.lengthSq ** .5;
   }

   get angle() {
      let norm = this.normalized();
      let angle_sin = Math.asin(norm.y);

      let angle = angle_sin;
      //Check other quadrants, note that asin returns negative elements
      if(norm.x < 0) angle = Math.PI - angle_sin;

      return angle;
   }
}

class Particle {
   constructor(mass, charge, position, color) {
      this.color = color || (charge > 0 ? "#FF0000" : "#0000FF");

      this.mass = mass;
      this.charge = charge;

      this.position = position;
      this.velocity = Vector.zero();
      this.currForce = Vector.zero();
   }

   step(dt, world) {
      let force = new Vector(0,0);
      world.others.forEach(p => {
         let direction = p.position.sub(this.position);
         let currForce = direction.normalized().mult(
            K * this.charge * p.charge / direction.lengthSq
         );

         force.add(currForce);
      });

      this.currForce = force;
      let acceleration = force.div(mass);
      this.velocity.add(acceleration);
   }

   draw() {
   }
}

class Simulation {
   constructor(width, height) {
      this.width = width;
      this.height = height;
   
      this.particles = [];
   }

   run() {
      let last = Date.now().getMilliseconds();
      setInterval(() => {
         let now = Date.now().getMilliseconds();
         let dt = now - last;
         last = now;

         let world = {
            width: this.world,
            height: this.height,
            others: this.particles.slice()
         }
         
         for(let particle of this.particles) particle.step(dt, world);
      }, 1);
   }
}

