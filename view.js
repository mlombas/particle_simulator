const VECTORNORMALLENGTH = 20;

class Drawable {
   draw(ctx) { throw new Error("Draw method not implemented on drawable"); }

   static from(object) {
      if(object instanceof Vector) return new VectorDrawable(object);

      return null;
   }
}

class VectorDrawable extends Drawable {
   constructor(vector, {associatedObject, color, minArrowLength}={}) {
      super();

      this.vector = vector;
      this.associated = associatedObject;
      this.color = color || "#0000FF";
      this.minArrowLength = minArrowLength || 2;
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
      let vectorLen = Math.sqrt(Math.abs(this.vector.length - VECTORNORMALLENGTH));

      ctx.rotate(this.vector.angle);
      ctx.fillStyle = this.color;

      let arrowLength = vectorLen > this.minArrowLength ?
         this.minArrowLength :
         this.minArrowLength - vectorLen;

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

class LayerDrawer {
   constructor() {
      this.layers = {};
   }

   add(drawable, layer) {
      //Create new or add to existent
      if(layer in this.layers)
         this.layers[layer].push(drawable);
      else
         this.layers[layer] = [drawable];
   }

   draw(ctx) {
      ctx.save();

      //Now for every layer in order, draw
      let layerNames = Object.keys(this.layers).sort();
      for(let name of layerNames) {
         let layer = this.layers[name];

         for(let object of layer) object.draw(ctx);
      }

      ctx.restore();
   }
}

class Camera {
   constructor(translation, scaling, next) {
      this.translation = translation || Vector.zero();
      this.scaling = scaling || Vector.one();
      this.next = next;
   }

   run() {
      setInterval(() => { 
         this.draw(ctx);
      }, 1000/60);
   }

   translate(vector) {
      this.translation.set(
         this.translation.add(
            vector.multElementByElement(
               Vector.one().divElementByElement(this.scaling)
            )
         )
      );
   }

   scale(factor) {
      this.scaling.set(this.scaling.mult(factor));
   }

   lock(particle) {
      this.locked = particle;
   }
   unlock() {
      this.locked = null;
   }

   draw(ctx) {
      ctx.save();

      let width = ctx.canvas.clientWidth;
      let height = ctx.canvas.clientHeight;

      //Clear view
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      let centerVector = (new Vector(width, height)).div(2);
      if(this.locked) 
         this.translation = this.locked.position
         .multElementByElement(new Vector(-1, 1));


      let truePosition = this.translation
         .multElementByElement(this.scaling)
         .add(centerVector);

      ctx.translate(truePosition.x, truePosition.y);

      ctx.scale(this.scaling.x, -this.scaling.y);
      this.next.draw(ctx);

      ctx.restore();
   }
}
