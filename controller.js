class Controller {
   constructor(simulation, pipeline) {
      this.simulation = simulation;
      this.pipeline = pipeline;
   }

   addParticle(pos) {
      let particle = new Particle(.1, 1e-3, pos);
      this.simulation.add(particle);

      let drawable = new ParticleDrawable(particle);
      let layers = this.pipeline.get("layers");
      layers.add(drawable, 1);
      layers.add(drawable.getVelocityDrawable());
      layers.add(drawable.getForceDrawable());
   }

   start() {
      this.simulation.start();
   }
   stop() {
      this.simulation.stop();
   }
}
