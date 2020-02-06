class Drawable {
   draw(ctx) { throw new Error("Draw method not implemented on drawable"); }

   static from(object) {
      if(object instanceof Vector) return new VectorDrawable(object);

      return null;
   }
}

class VectorDrawable extends Drawable {
   constructor(vector, associatedObject, color, minArrowLength) {
      super();

      this.vector = vector;
      this.associated = associatedObject || {position: Vector.zero()};
      this.color = color || "#0000FF";
      this.minArrowLength = minArrowLength || 20;
   }

   draw(ctx) {
      ctx.save();

      let position = this.associated.position;
      let vectorLen = this.vector.length;

      ctx.translate(position.x, position.y);
      ctx.rotate(this.vector.angle);
      ctx.fillStyle = "#0000FF";

      //Stick, draw it elongated
      ctx.fillRect(0, -this.minArrowLength / 4, vectorLen, this.minArrowLength / 2);

      //Arrow head
      ctx.translate(vectorLen, 0);

      let arrowLength = vectorLen > this.minArrowLength ?
         this.minArrowLength :
         this.minArrowLength - vectorLen;

      ctx.beginPath();
      ctx.lineTo(0, -10);
      ctx.lineTo(arrowLength, 0);
      ctx.lineTo(0, 10);
      ctx.closePath();
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

   draw(ctx) {
      ctx.save();

      let width = ctx.canvas.clientWidth;
      let height = ctx.canvas.clientHeight;

      //Clear view
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      let truePositionX = this.translation.x + width/2;
      let truePositionY = this.translation.y + height/2;
      ctx.translate(truePositionX, truePositionY);

      ctx.scale(this.scaling.x, -this.scaling.y);

      this.next.draw(ctx);

      ctx.restore();
   }
}
