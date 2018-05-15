import React from 'react';
import settings from '../../settings';

class Organism extends React.Component {
  constructor(genetics = {}) {
    if (!genetics.x) genetics.x = random.randInt(1, setting.world.width * setting.tile.size - this.size);
    if (!genetics.y) genetics.y = random.randInt(1, setting.world.height * setting.tile.size - this.size);
    genetics.size = 5;
    this.state = genetics;
  }
}
