// @flow
import { Architect } from 'synaptic';

export default class Herd {
  species: 'wolf' | 'sheep';
  size: number;
  color: string;
  creatures: Array<Architect>;

  constructor({
    species,
    size,
    color,
    creatures,
  }: {
    species: 'wolf' | 'sheep',
    size: number,
    color: string,
    creatures: Array<Architect>,
  }) {
    this.species = species;
    this.size = size;
    this.color = color;
    this.creatures = creatures;
  }
}
