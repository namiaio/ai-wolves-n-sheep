// @flow
import { nomAudio } from './audio.js';

import Vector from './Vector.js';
import Creature from './Creature.js';

export default class Wolf extends Creature {
  targetAngle() {
    const alignment = this.getNearestPray();
    return (alignment.angle() + Math.PI) / (Math.PI * 2);
  }

  moveTo(networkOutput: Array<number>) {
    const force = new Vector(0, 0);

    const target = new Vector(
      networkOutput[1] * this.world.width,
      networkOutput[2] * this.world.height
    );

    const separation = this.separate({
      neighbours: this.herd.creatures,
      minDist: 60,
    });
    const cohesion = this.seek(target);
    const pray = this.getNearestPray().setMag(networkOutput[0]);

    force.add(separation.div(1.5));
    force.add(cohesion.div(5));
    force.add(pray);

    this.applyForce(force);
  }

  getNearestPray() {
    const self = this;
    const sum = new Vector(0, 0);

    const pray = this.world.herds.reduce((prayAcc, herd) => {
      return herd.species === 'wolf'
        ? prayAcc
        : [...prayAcc, ...herd.creatures];
    }, []);
    let closestPray /*: ?Creature */;
    pray.reduce((prevDistance, currentPray, prayIdx) => {
      // Check if pray is active
      if (!currentPray.maxspeed) {
        return prevDistance;
      }
      const distanceToPray = Math.abs(this.location.dist(currentPray.location));
      if (distanceToPray < 5) {
        console.log('nom');
        nomAudio.play();
        currentPray.maxspeed = 0;
      }
      if (distanceToPray < prevDistance) {
        closestPray = pray[prayIdx];
        return distanceToPray;
      }
      prevDistance;
    }, Infinity);

    // If no pray left, continue movement at a slower pace.
    if (!closestPray) {
      self.minspeed = 0.5;
      self.maxspeed = 0.8;
      return sum;
    }

    const d = self.location.dist(closestPray.location);
    const diff = self.location.copy().sub(closestPray.location);
    diff.normalize();
    diff.div(d);
    sum.sub(diff);

    sum.normalize();
    sum.mul(self.maxspeed);
    sum.sub(self.velocity);
    sum.limit(self.maxforce);

    return sum.mul(1.5);
  }
}
