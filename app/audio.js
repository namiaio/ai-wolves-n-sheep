import { Howl, Howler } from 'howler';

Howler.volume(0.8);

export const farmAudio = new Howl({
  src: ['assets/audio/farm.mp3'],
  loop: true,
  volume: 1,
});

export const bleatAudios = [
  new Howl({
    src: ['assets/audio/bleat1.mp3'],
    volume: 0.3,
    sprite: {
      bleat: [0, 1500],
    },
  }),
  new Howl({
    src: ['assets/audio/bleat2.mp3'],
    volume: 0.5,
  }),
  new Howl({
    src: ['assets/audio/bleat3.mp3'],
    volume: 0.2,
  }),
];

export const nomAudio = new Howl({
  src: ['assets/audio/nom.wav'],
  volume: 0.3,
});
