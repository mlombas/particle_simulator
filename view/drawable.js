class Drawable {
   draw(ctx) { throw new Error("Draw method not implemented on drawable"); }

   static from(object) {
      if(object instanceof Vector) return new VectorDrawable(object);

      return null;
   }
}

class VectorDrawable extends Drawable {
   constructor(vector, {
      associatedObject,
      color,
      minVectorLength,
      normalArrowLength
   }={}) {

      super();

      this.vector = vector;
      this.associated = associatedObject;
      this.color = color || "#0000FF";

      this.minVectorLength = minVectorLength || 2;
      this.normalArrowLength = normalArrowLength || 10;
   }

   draw(ctx) {
      //Dont draw vector if length is 0
      if(this.vector.lengthSq == 0) return;

      ctx.save();

      if(this.associated) {
         let position = this.associated.position;
         ctx.translate(position.x, position.y);
         if(this.associated.radius) {
            let movementOutsideRadius = this.vector.normalized().
               mult(this.associated.radius);
            ctx.translate(movementOutsideRadius.x, movementOutsideRadius.y);
         }
      }

      //Vector will be drawn so its close to a value
      let vectorLen = 
         this.vector.lengthSq < Math.pow(this.normalArrowLength, 2) ?
         this.vector.length : 
         this.normalArrowLength + Math.sqrt(
            this.vector.length - this.normalArrowLength
         );
      vectorLen = Math.max(vectorLen, this.minVectorLength);

      let arrowLength = Math.sqrt(vectorLen/10);

      ctx.rotate(this.vector.angle);
      ctx.fillStyle = this.color;

      //Stick, draw it elongated
      ctx.fillRect(0, -arrowLength/2, vectorLen, arrowLength);

      //Arrow head
      ctx.translate(vectorLen, 0);

      ctx.beginPath();
      ctx.lineTo(0, -arrowLength);
      ctx.lineTo(arrowLength, 0);
      ctx.lineTo(0, arrowLength);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
   }
}

class ParticleDrawable extends Drawable {
   constructor(particle, {color}={}) {
      super();

      this.particle = particle;


   }

   getVelocityDrawable() {
      return new VectorDrawable(this.particle.velocity, {
         associatedObject: this.particle,
         color: "brown"
      });
   }

   getForceDrawable() {
      return new VectorDrawable(this.particle.currForce, {
         associatedObject: this.particle,
         color: "green"
      });
   }
   
   draw(ctx) {
      ctx.save();

      ctx.fillStyle = this.color || (this.particle.charge > 0 ? "red" : "blue");

      ctx.translate(this.particle.position.x, this.particle.position.y);

      ctx.beginPath();
      ctx.arc(0, 0, this.particle.radius, 0, 2*Math.PI);
      ctx.fill();

      ctx.restore();
   }
}
