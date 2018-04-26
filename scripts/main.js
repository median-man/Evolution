require([
  'jquery',
  'config',
  'models/Tile',
  'models/Plant',
  'models/Herbivore',
  'utilities/collision',
  'utilities/find',
  'utilities/touching'
], function($, config, Tile, Plant, Herbivore, collision, find, touching) {

  // global variables
  let i, j, k;
  let tiles = [];
  let plants = [];
  let herbivores = [];
  let $world = $('#world');

  // initial page load
  start()

  function start() {
    spawnTiles()
    spawnPlants()
    updateDOM()
  }

  function spawnTiles() {
    // delete everything
    $world.empty()

    // generate new tile objects
    tiles = [];
    let tileCount = config.world.height * config.world.width;
    for (i = 0; i < tileCount; i++) {
      tiles.push(new Tile())
    }

    // DOM tile grid where i = rows, j = columns
    for (i = 0; i < config.world.height; i++) {
      let $row = $('<div class="row">');
      for (j = 0; j < config.world.width; j++) {
        $row.append(Tile.createElement())
      }
      $world.append($row)
    }
  }

  function spawnPlants() {
    for (i = 0; i < config.spawnCount.plants; i++) {
      let newPlant = new Plant();

      // check if it has space to spawn
      let hasSpace = true;
      plants.forEach((plant) => {
        let isTouching = touching({
          x: newPlant.x,
          y: newPlant.y,
          size: config.plantSize
        }, {
          x: plant.x,
          y: plant.y,
          size: config.plantSize
        })
        if (isTouching) hasSpace = false;
      })
      if (hasSpace) {
        newPlant.spawn()
        plants.push(newPlant)
      }
    }
  }

  function spawnHerbivores() {
    // generate new herbivore objects
    for (i = 0; i < config.spawnCount.herbivores; i++) {
      const newHerbivore = new Herbivore();
      newHerbivore.spawn()
      herbivores.push(newHerbivore);
    }
  }

  function spawnCarnivores() {

  }

  // maintenence
  function updateWorld() {
    reproducePlants()
    feedPlants()
    moveHerbivores()
    feedHerbivores()
    reproduceHerbivores()
    // doubleCheck()
    updateDOM()
  }

  function reproducePlants() {
    plants.forEach((plant) => {
      if (plant.reproductionCycle === 0) {
        let newPlant = plant.reproduce();
        if (newPlant) {
          let hasSpace = true;
          plants.forEach((plant2, j) => {
            const isTouching = touching({
              x: newPlant.x,
              y: newPlant.y,
              size: config.plantSize
            }, {
              x: plant2.x,
              y: plant2.y,
              size: config.plantSize
            })
            if (isTouching) hasSpace = false;
          })
          if (hasSpace) {
            newPlant.spawn()
            plants.push(newPlant)
            plant.reproductionCycle = config.reproductionRate.plant;
          }
        }
      } else {
        plant.reproductionCycle--
      }
    })
  }

  function feedPlants() {
    plants.forEach((plant, i) => {
      const parentTile = tiles[find.tile(plant)];
      plant.grow(parentTile.fertility)

      // plant dies if its growth is 0
      if (plant.growth <= 0) {
        $('#' + plant.id).remove()
        plants.splice(i, 1);
      }
    })
  }

  function moveHerbivores() {
    herbivores.forEach((herbivore) => {
      // moving
      const adjacentTileIDs = find.adjacentTiles(herbivore);
      // convert ID's to Tile obejcts
      let adjacentTiles = new Object();
      for (k in adjacentTileIDs) {
        adjacentTiles[k] = tiles[adjacentTileIDs[k]];
      }

      const direction = find.direction(herbivore, adjacentTiles);
      herbivore.move(direction)
    })
  }

  function feedHerbivores() {
    herbivores.forEach((herbivore, i) => {
      // update hunger
      herbivore.hunger -= config.hungerLoss;

      // eat plants
      plants.forEach((plant, j) => {
        const isTouching = touching({
          x: herbivore.x,
          y: herbivore.y,
          size: config.animalSize
        }, {
          x: plant.x,
          y: plant.y,
          size: config.plantSize
        })
        if (isTouching) {
          let amountToEat = Math.round(100 - herbivore.hunger);
          if (plant.growth <= amountToEat) {
            amountToEat = plant.growth;

            // plant dies
            $('#' + plant.id).remove()
            plants.splice(j, 1);
          } else {
            plant.growth -= amountToEat;
          }
          herbivore.hunger += amountToEat;
        }
      })

      // herbivore dies if hunger is 0 or less
      if (herbivore.hunger <= 0) {
        $('#' + herbivore.id).remove()
        herbivores.splice(i, 1);
      }
    })
  }

  function reproduceHerbivores() {
    herbivores.forEach((herbivore) => {
      if (herbivore.reproductionCycle === 0) {
        let newHerbivore = herbivore.reproduce();
        if (newHerbivore) {
          newHerbivore.spawn()
          herbivores.push(newHerbivore)
          herbivore.reproductionCycle = config.reproductionRate.herbivore;
        }
      } else {
        herbivore.reproductionCycle--
      }
    })
  }

  function updateDOM() {
    // update tile color
    $.each($('.tile'), function(i, tile) {
      const fertility = tiles[i].fertility;
      $(tile).css({
        backgroundColor: 'rgb(' + (200 - (100 * fertility)) + ', 200, 100)'
      })
    })

    // update text
    plants.forEach((plant) => {
      $('#' + plant.id).text(plant.growth)
    })
    herbivores.forEach((herbivore) => {
      $('#' + herbivore.id).text(herbivore.hunger)
    })
  }

  function doubleCheck() {
    // make sure no plants got left behind
    $.each($('.plant'), (i, $plant) => {
      let shouldExist = false;
      plants.forEach((plant) => {
        if (plant.id === $($plant).attr('id')) {
          shouldExist = true;
        }
      })
      if (!shouldExist) {
        $($plant).remove()
        console.log('Found a bug - tkaue')
      }
    })
  }

  // DEBUG //
  window.tiles = tiles;
  window.plants = plants;
  window.herbivores = herbivores;
  // DEBUG //

  $('#cycle').on('click', updateWorld)
  $('#spawn-herbivores').on('click', spawnHerbivores)
  $('.tile').on('click', function() {
    console.log(herbivores)
  })
  $(document).on('keyup', updateWorld)
})
