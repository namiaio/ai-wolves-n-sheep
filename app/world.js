// @flow
import $ from 'jquery';
import { farmAudio, bleatAudios } from './audio.js';

import Herd from './Herd.js';
import Creature from './Creature.js';
import Wolf from './Wolf.js';

function run() {
  const timer = $('#timer')[0];
  const canvas = $('#canvas')[0];
  const ctx = canvas.getContext('2d');
  const fps = 100; // Default 100

  canvas.width = $('#canvas-container').width();
  $(window).resize(function() {
    const width = $('#canvas-container').width();
    canvas.width = width;
    world.width = width;
  });

  // Wolves must be added last, as they receive the sheep's output as input.
  const world = {
    width: canvas.width,
    height: canvas.height,
    context: ctx,
    herds: [
      new Herd({
        species: 'sheep',
        size: 15,
        color: '#d9d9d9',
        creatures: [],
      }),
      new Herd({
        species: 'sheep',
        size: 15,
        color: '#fafafa',
        creatures: [],
      }),
      new Herd({
        species: 'sheep',
        size: 15,
        color: '#fafafa',
        creatures: [],
      }),
      new Herd({
        species: 'wolf',
        size: 3,
        color: 'red',
        creatures: [],
      }),
    ],
  };

  const sheepCount = world.herds.reduce((sheepAcc, sheep) => {
    return sheep.species === 'sheep' ? sheepAcc + sheep.size : sheepAcc;
  }, 0);

  // Populate
  for (let t = 0; t < world.herds.length; t++) {
    for (let i = 0; i < world.herds[t].size; i++) {
      // console.log('creature: ' + i);
      const herd = world.herds[t];
      const isWolf = herd.species === 'wolf';
      const x = Math.random() * world.width;
      const y = Math.random() * world.height;
      const args = {
        inputLayers: isWolf ? 3 * sheepCount : herd.size * 4,
        world,
        herd,
        x,
        y,
      };

      const creature = isWolf ? new Wolf(args) : new Creature(args);
      creature.velocity.random();
      herd.creatures[i] = creature;
    }
  }

  let startTime = 0;
  let prevActiveSheep = 0;

  const loop = function() {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, world.width, world.height);
    ctx.globalAlpha = 1;

    let wolfInput = [];
    let activeSheep = 0;

    // Update each creature
    world.herds.forEach(herd => {
      herd.creatures.forEach(creature => {
        // Check if creature is inactive
        if (!creature.maxspeed) {
          creature.draw();
          if (!(creature instanceof Wolf)) {
            wolfInput = [...wolfInput, ...[0, 0, 0]];
          }
          return;
        }
        let input = [];
        let output = [];
        const herdLen = herd.creatures.length;

        if (creature instanceof Wolf) {
          input = wolfInput;
        } else {
          activeSheep += 1;
          for (let i = 0; i < herdLen; i += 1) {
            const {
              location: { x: locX, y: locY },
              velocity: { x: velX, y: velY },
            } = herd.creatures[i];
            // Sheep input count per sheep === 4
            input = [...input, locX, locY, velX, velY];
          }
        }

        // Activate network and move creature
        output = creature.network.activate(input);
        if (!(creature instanceof Wolf)) {
          // Wolf input count per sheep === 3
          wolfInput = [...wolfInput, ...output];
        }
        creature.moveTo(output);

        // Learn
        const learningRate = 0.4;
        const target = [
          creature.targetX(world),
          creature.targetY(world),
          creature.targetAngle(),
        ];
        creature.network.propagate(learningRate, target);

        // Draw
        creature.draw();
      });
    });

    // Check if this is the initial run for the loop func.
    if (!prevActiveSheep && activeSheep) {
      startTime = Date.now();
      // Start bg audio
      farmAudio.play();
    }
    // While any sheep still active
    if (activeSheep) {
      /**
       * Tick timer.
       * Loops after 24hrs. Much sad. Please don't keep the poor sheep going that long.
       * https://stackoverflow.com/a/35890816/2488877
       */
      timer.innerHTML = new Date(Date.now() - startTime)
        .toISOString()
        .slice(11, -2);
    }
    // Next run after last sheep has gone,
    if (prevActiveSheep && !activeSheep) {
      timer.style.color = 'black';
    }

    // Make the main ambient go lower as the amount of sheep lessens.
    farmAudio.volume(activeSheep / sheepCount);
    // Control extra sounds
    if (activeSheep && activeSheep < prevActiveSheep && activeSheep % 3 === 0) {
      const bleatNum = Math.floor(Math.random() * 3);
      bleatAudios[bleatNum].play(bleatNum === 0 ? 'bleat' : undefined);
    }

    prevActiveSheep = activeSheep;

    if (true) setTimeout(loop, 1000 / fps);
  };

  // Start loop
  loop();
}

export default run;
