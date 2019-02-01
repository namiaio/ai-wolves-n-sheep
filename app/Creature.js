// @flow
import Vector from './Vector.js';
import Herd from './Herd.js';
import { Architect } from 'synaptic';

class Creature {
  network: Architect;
  world: Object;
  herd: Object;
  mass: number;
  maxspeed: number;
  originalMaxspeed: number;
  minspeed: number;
  maxforce: number;
  originalMaxforce: number;
  length: number;
  base: number;
  HALF_PI: number;
  TWO_PI: number;
  location: Vector;
  velocity: Vector;
  acceleration: Vector;
  color: string;
  stampedeColor: string;

  constructor({
    inputLayers,
    x,
    y,
    world,
    herd,
  }: {
    inputLayers: number,
    x: number,
    y: number,
    world: Object,
    herd: Herd,
  }) {
    this.network = new Architect.Perceptron(inputLayers, 20, 3);
    this.world = world;
    this.herd = herd;
    this.mass = Math.random() * (0.35 - 0.3) + 0.3;
    this.length = this.mass * 10;
    this.base = this.length * 0.5;
    const maxspeedMultiplier = this.constructor === Creature ? 0.9 : 1;
    const min = maxspeedMultiplier * 1.5;
    const max = maxspeedMultiplier * 2;
    this.maxspeed = Math.random() * (max - min) + min + this.mass * min;
    this.originalMaxspeed = this.maxspeed;
    this.minspeed = this.maxspeed - 0.5;
    this.maxforce = Math.random() * (0.5 - 0.1) + this.mass / 2;
    this.originalMaxforce = this.maxforce;
    this.HALF_PI = Math.PI * 0.5;
    this.TWO_PI = Math.PI * 2;
    this.location = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.color = herd.color;
    this.stampedeColor = 'white';
  }

  targetX(world: Object) {
    const cohesion = this.cohesion(this.herd.creatures);
    return cohesion.x / world.width;
  }

  targetY(world: Object) {
    const cohesion = this.cohesion(this.herd.creatures);
    return cohesion.y / world.height;
  }

  targetAngle() {
    const alignment = this.align(this.herd.creatures);
    return (alignment.angle() + Math.PI) / (Math.PI * 2);
  }

  moveTo(networkOutput: Array<number>) {
    if (!this.maxspeed) {
      return;
    }
    const force = new Vector(0, 0);

    const target = new Vector(
      networkOutput[0] * this.world.width,
      networkOutput[1] * this.world.height
    );
    const angle = networkOutput[2] * this.TWO_PI - Math.PI;

    const separation = this.separate({ neighbours: this.herd.creatures });
    const alignment = this.align(this.herd.creatures).setAngle(angle);
    const cohesion = this.seek(target);

    force.add(separation);
    force.add(alignment);
    force.add(cohesion);

    this.applyForce(force);
  }

  draw() {
    this.update();

    const ctx = this.world.context;
    ctx.lineWidth = 1;

    const angle = this.velocity.angle();

    const x1 = this.location.x + Math.cos(angle) * this.base;
    const y1 = this.location.y + Math.sin(angle) * this.base;

    ctx.lineWidth =
      this.color === this.stampedeColor ? this.length + 0.5 : this.length;
    const color = this.maxspeed ? this.color : '#44aa44';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.arc(x1, y1, this.base, 0, this.TWO_PI);
    ctx.stroke();
    ctx.fill();
  }

  update() {
    this.boundaries();
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    if (this.velocity.mag() < this.minspeed) {
      this.velocity.setMag(this.maxspeed);
    }
    this.location.add(this.velocity);
    this.acceleration.mul(0);
  }

  applyForce(force: Vector) {
    this.acceleration.add(force);
  }

  boundaries() {
    if (this.location.x < 15) this.applyForce(new Vector(this.maxforce * 2, 0));

    if (this.location.x > this.world.width - 15)
      this.applyForce(new Vector(-this.maxforce * 2, 0));

    if (this.location.y < 15) this.applyForce(new Vector(0, this.maxforce * 2));

    if (this.location.y > this.world.height - 15)
      this.applyForce(new Vector(0, -this.maxforce * 2));
  }

  seek(target: Vector) {
    const seek = target.copy().sub(this.location);
    seek.normalize();
    seek.mul(this.maxspeed);
    seek.sub(this.velocity).limit(0.3);

    return seek;
  }

  // This separates creatures from each other.
  separate({
    neighbours,
    minDist = 25,
  }: {
    neighbours: Array<Creature>,
    minDist?: number,
  }) {
    const self = this;
    const sum = new Vector(0, 0);
    let count = 0;
    let stampede = false;

    neighbours.forEach(neighbour => {
      if (neighbour != self && neighbour.maxspeed) {
        const d = self.location.dist(neighbour.location);
        // Control how far the creatures should separate.
        if (d < minDist && d > 0) {
          const diff = self.location.copy().sub(neighbour.location);
          diff.normalize();
          diff.div(d);
          sum.add(diff);
          count++;
        }
        if (self.constructor === Creature && d < minDist + 10) {
          stampede = true;
        }
      }
    });

    // Stampeding makes sheep a bit faster and stronger.
    self.maxspeed = stampede
      ? self.originalMaxspeed + 0.65
      : self.originalMaxspeed;
    self.maxforce = stampede
      ? self.originalMaxforce + 0.01
      : self.originalMaxforce;
    self.color = stampede ? self.stampedeColor : self.herd.color;

    if (!count) {
      return sum;
    }
    sum.div(count);
    sum.normalize();
    sum.mul(self.maxspeed);
    sum.sub(self.velocity);
    sum.limit(self.maxforce);

    return sum.mul(2);
  }

  // Make the creatures align with each other.
  align(neighbours: Array<Creature>) {
    const sum = new Vector(0, 0);
    let count = 0;
    neighbours.forEach(neighbour => {
      if (neighbour != this && neighbour.maxspeed) {
        sum.add(neighbour.velocity);
        count++;
      }
    });
    if (!count) {
      return sum;
    }
    sum.div(count);
    sum.normalize();
    sum.mul(this.maxspeed);

    sum.sub(this.velocity).limit(this.maxspeed);

    return sum.limit(0.15);
  }

  // Make the creatures come closer to each other.
  cohesion(neighbours: Array<Creature>) {
    const sum = new Vector(0, 0);
    let count = 0;
    neighbours.forEach(neighbour => {
      if (neighbour != this && neighbour.maxspeed) {
        sum.add(neighbour.location);
        count++;
      }
    });
    if (!count) {
      return sum;
    }
    sum.div(count);

    return sum;
  }
}

export default Creature;
