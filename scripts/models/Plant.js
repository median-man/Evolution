define(['../config', '../utilities/random'], function(config, random) {

  class Plant {
    constructor() {
      this.id = random.randStr(8);
      this.x = random.randInt(1, config.world.width * config.tileSize - config.plantSize);
      this.y = random.randInt(1, config.world.height * config.tileSize - config.plantSize);
      this.growth = 0;
      this.reproductionCycle = random.randInt(1, config.reproductionRate.plant + 1);
    }

    spawn() {
      let $e = $('<div class="plant">0</div>');
      $e.attr('id', this.id)
      $e.css({
        top: this.y,
        left: this.x
      })
      $('#world').append($e)
    }

    grow(fertility) {
      const maxGrowth = Math.round(fertility * 1000);

      // need to round because JS is bad at math
      if (this.growth < maxGrowth) {
        this.growth += Math.round(fertility * 10);
      }

      // limit the max number
      if (this.growth > maxGrowth) this.growth = maxGrowth;
    }

    reproduce() {
      let offspring = new Plant();
      offspring.reproductionCycle = config.reproductionRate.plant + 1;

      const randomX = random.randInt(config.plantSize * -3, config.plantSize * 3);
      const randomY = random.randInt(config.plantSize * -3, config.plantSize * 3);
      offspring.x = this.x + randomX;
      offspring.y = this.y + randomY;

      const limit = {
        top: 0,
        left: 0,
        right: config.world.width * config.tileSize - config.plantSize,
        bottom: config.world.height * config.tileSize - config.plantSize
      };

      if (offspring.y >= limit.top && offspring.x >= limit.left
       && offspring.x <= limit.right && offspring.y <= limit.bottom) {
        return offspring;
      }
      return false;
    }
  }

  return Plant;
})
