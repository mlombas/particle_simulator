const MASSTORADIUSRATIO = 100;
const K = 9e9; //Electrical constant, rounded

class Vector {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }

   static zero() {
      return new Vector(0, 0);
   }
   static one() {
      return new Vector(1, 1);
   }

   set(other) {
      this.x = other.x;
      this.y = other.y;
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
   multElementByElement(vec) {
      return new Vector(this.x * vec.x, this.y * vec.y);
   }
   div(scalar) {
      return this.mult(1/scalar);
   }
   divElementByElement(vec) {
      return new Vector(this.x / vec.x, this.y / vec.y);
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
   constructor(mass, charge, position, radius) {
      this.mass = mass;
      this.charge = charge;
      this.radius = radius || mass * MASSTORADIUSRATIO;

      this.position = position;
      this.velocity = Vector.zero();
      this.currForce = Vector.zero();
   }

   static copy(particle) {
      return new Particle(
         particle.mass,
         particle.charge,
         particle.position,
         particle.radius
      );
   }

   reset() {
      this.currForce.set(Vector.zero());
   }

   act(world) {
      for(let p of world.others) {
         let direction = p.position.sub(this.position);

         //If in the same spot, do not attract
         if(direction.lengthSq == 0) continue;

         let force = direction.normalized().mult(
            K * this.charge * p.charge / direction.lengthSq 
         );
         p.addForce(force);
      }
   }

   step(dt) {
      let acceleration = this.currForce.div(this.mass).mult(dt);
      this.velocity.set(this.velocity.add(acceleration));

      this.position.set(this.position.add(this.velocity.mult(dt)));
   }

   addForce(f) {
      this.currForce.set(this.currForce.add(f));
   }
}

class Simulation {
   constructor(width, height, timeScale) {
      this.width = width;
      this.height = height;

      this.timeScale = timeScale || 1;
   
      this.particles = [];
   }

   setScale(timeScale) {
      this.timeScale = timeScale;
   }

   add(particle) {
      this.particles.push(particle);
   }

   *getParticlesCopy() {
      for(let particle of this.particles) {
         yield Particle.copy(particle);
      }
   }

   getParticles() {
      return this.particles;
   }

   update(dt) {
      for(let particle of this.particles) particle.reset();

      for(let particle of this.particles) { 
         particle.act({
            width: this.width,
            height: this.height,
            others: this.particles.filter(p => p != particle)
         });
      }

      for(let particle of this.particles) particle.step(dt);
   }

   stop() {
      clearInterval(this.interval);
   }

   start() {
      let last = Date.now();
      this.interval = setInterval(() => {
         let now = Date.now();
         let dt = (now - last) / 1e3 * this.timeScale;
         last = now;

         this.update(dt);
      }, 0.001);
   }
}

