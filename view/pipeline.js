class Pipeline {
   constructor(ctx) {
      this.ctx = ctx;

      this.line = [];
      this.tags = {};
   }

   add(element, tag, position) {
      let index = position || this.line.length;

      this.line.splice(index, 0, element);

      if(tag) this.tags[tag] = element;
   }

   has(tag) {
      return this.tags[tag] != undefined;
   }

   get(tag) {
      if(this.has(tag)) return this.tags[tag];
   }

   run() {
      setInterval(() => this.render(), 1);
   }

   render() {
      this.ctx.save();

      for(let element of this.line) {
         element.draw(this.ctx);
      }

      this.ctx.restore();
   }
}

class PipelineElement {
   draw(ctx) {
      throw new Error("Draw not implemented in pipelineElement");
   }
}

class LayerDrawer extends PipelineElement {
   constructor() {
      super();

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
      //Now for every layer in order, draw
      let layerNames = Object.keys(this.layers).sort();
      for(let name of layerNames) {
         let layer = this.layers[name];

         for(let object of layer) object.draw(ctx);
      }
   }
}

class Camera extends PipelineElement {
   constructor(translation, scaling) {
      super();

      this.translation = translation || Vector.zero();
      this.scaling = scaling || Vector.one();
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
      let width = ctx.canvas.clientWidth;
      let height = ctx.canvas.clientHeight;

      let centerVector = (new Vector(width, height)).div(2);
      if(this.locked) 
         this.translation = this.locked.position
                              .multElementByElement(new Vector(-1, 1));

      let truePosition = this.translation
         .multElementByElement(this.scaling)
         .add(centerVector);

      ctx.translate(truePosition.x, truePosition.y);

      ctx.scale(this.scaling.x, this.scaling.y);
   }
}

class Flipper extends PipelineElement {
   draw(ctx) {
      ctx.scale(1, -1);
   }
}

class Clearer extends PipelineElement {
   draw(ctx) {
      ctx.save();
      
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

      ctx.restore();
   }
}

class Gridder extends PipelineElement {
   constructor(color, spaceX, spaceY, thickness) {
      super();

      this.color = color;
      this.space = new Vector(spaceX, spaceY);
      this.thickness = thickness;
   }

   draw(ctx) {
      let transform = ctx.getTransform();
      let scaling = new Vector(Math.abs(1/transform.a), Math.abs(1/transform.d));
      let trueCenter = new Vector(ctx.canvas.clientWidth, ctx.canvas.clientHeight).div(2);
      let dimension = trueCenter.multElementByElement(scaling);
      let center = new Vector(transform.e, transform.f);

      ctx.save();
      
      ctx.fillStyle = this.color;

      //Dunno how this formulae work, but they do
      let trueZero = trueCenter.sub(dimension);
      let imageZero = center.sub(trueCenter).multElementByElement(new Vector(-1, 1));
      let toFirstBar = new Vector(
         (trueZero.x - (imageZero.x - dimension.x)) * scaling.x % this.space.x,
         (trueZero.y - (imageZero.y - dimension.y)) * scaling.y % this.space.y
      );
      let start = imageZero
         .multElementByElement(scaling)
         .sub(dimension)
         .add(toFirstBar);
      let end = start.add(dimension.mult(2)).add(this.space);

      //Start with horizontal lines
      for(let x = start.x; x <= end.x; x += this.space.x){
         ctx.fillRect(
            x - this.thickness / 2, center.y * scaling.y,
            this.thickness, -2 * dimension.y
         );
      }

      //Now with y
      for(let y = start.y; y <= end.y; y += this.space.y){
         ctx.fillRect(
            -center.x * scaling.x, y - this.thickness / 2,
            2 * dimension.x, this.thickness
         );
      }

      ctx.restore();
   }
}
