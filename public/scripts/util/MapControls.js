import {DIRECTION} from '../util/helper_functions.js';
import {Game} from '../Game.js';
import {Controls} from './Controls.js';

export class MapControls extends Controls {
  constructor(data) {
    super(data);
    this.tooltips = data.tooltips;

    this._readyToInteract = false;
    this._inFightScene = false;
    this._atEndPoint = false;

    this.eventListeners = [];
  }

  addControlBindings() {
    if (this.isBound === false) {
      this.isBound = true;
      console.log('binding stuff');
      const self = this;
      this.container.addEventListener('keyup', function(event) {
        self.handleKeyUp(event);
      });
      this.container.addEventListener('keydown', function(event) {
        self.handleKeyDownLogic(event);
      });
    } else {
      console.log('already bound!');
      return;
    }
  }

  removeControlBindings() {
    // TODO: unbind controls, isn't actually unbinding the functions since they're anonymous
    console.log('unbinding stuff');
    const self = this;
    this.container.removeEventListener('keyup', function(event) {
      self.handleKeyUp(event);
    });
    this.container.removeEventListener('keydown', function(event) {
      self.handleKeyDownLogic(event);
    });
    return;
  }

  handleKeyUp(event) {
    this.keys[event.keyCode] = false;
  };

  handleKeyDownLogic(event) {
    this.keys[event.keyCode] = true;

    this.doKeyDown();

    // TODO: Reorganize this better in new class
    // TODO: move to checkMovementCollision();
    let isColliding = false;
    this.map.blockArray.forEach((node) => {
      if (this.player.checkCollision(node)) {
        // handle impassible walls here
        if (node.impassible === true) {
          this.doReverseMovement();
        }
        isColliding = true;
      }
    });
    if (isColliding) {
      this.player.shape.attrs.fill = 'red';
    } else {
      this.player.shape.attrs.fill = 'grey';
    }

    this.map.npcArray.forEach((node) => {
      this.player.checkCollision(node);
      node.checkPlayerDetection(this.player);
      if (this.player.isColliding(node)) {
        // trigger some interaction, for now, change colour
        // console.log('i am touching an NPC', node.id);
        // handle impassible NPCs here
        if (node.impassible === true) {
          this.doReverseMovement();
        }
        isColliding = true;
      }
      // TODO: move to checkSightCollision();
      if (node.isSeeing(this.player)) {
        // console.log('i see the player');

        this.tooltips.interaction.moveTo({
          x: node.x + 50,
          y: node.y - 50,
        });

        this.layer.add(this.tooltips.interaction.renderBox, this.tooltips.interaction.renderText);
        // not sure why adding tooltip by a group doesn't work
        // layer.add(tooltip.render);

        this.layer.draw();
        this._readyToInteract = true;
      } else {
        this.tooltips.interaction.remove();
        this._readyToInteract = false;
      }
    });
    // TODO: move to checkPointCollision()
    this.map.spawnArray.forEach((node) => {
      this.player.checkCollision(node);
      if (this.player.isColliding(node)) {
        // trigger some interaction, for now, change colour
        if (node.name === 'start') {
          // console.log('i am at the spawn', node.id);
        } else if (node.name === 'end') {
          // console.log('i am a winner', node.id);
          this._atEndPoint = true;
          this.layer.add(this.tooltips.completion.renderBox, this.tooltips.completion.renderText);
          this.layer.draw();
        }
      } else {
        this._atEndPoint = false;
        this.tooltips.completion.remove();
      }
    });

    event.preventDefault();
    this.layer.batchDraw();
  }

  doKeyDown() {
    // Down arrow or W for moving sprite down
    if (this.keys[40] || this.keys[83]) {
      this.player.move(DIRECTION.UP);
    } else if (this.keys[38] || this.keys[87]) {
      // Up arrow or S to move sprite up
      this.player.move(DIRECTION.DOWN);
    }

    // Left arrow or A for moving sprite left
    if (this.keys[37] || this.keys[65]) {
      this.player.move(DIRECTION.LEFT);
    } else if (this.keys[39] || this.keys[68]) {
      // Right arrow or D to move sprite right
      this.player.move(DIRECTION.RIGHT);
    }

    // Space or E for interaction
    if (this.keys[32] || this.keys[69]) {
      console.log(this._atEndPoint);
      if (this._atEndPoint) {
        alert('YOU WIN! Play again?');
        location.reload();
      } else if (this._inFightScene) {
        const game = Game.getInstance();
        game.switchToMap();
        this._inFightScene = false;
      } else if (this._readyToInteract) {
        const game = Game.getInstance();
        game.switchToFight();
        this._inFightScene = true;
      }
    }
    // Escape or P for pausing (to menu)
    if (this.keys[27] || this.keys[80]) {
      alert('Game Paused\nPress ok to continue');
      this.keys[27] = false;
      this.keys[80] = false;
    }
  }

  doReverseMovement() {
    // Down arrow or W for moving sprite down
    if (this.keys[40] || this.keys[83]) {
      this.player.move(DIRECTION.DOWN);
    } else if (this.keys[38] || this.keys[87]) {
      // Up arrow or S to move sprite up
      this.player.move(DIRECTION.UP);
    }

    // Left arrow or A for moving sprite left
    if (this.keys[37] || this.keys[65]) {
      this.player.move(DIRECTION.RIGHT);
    } else if (this.keys[39] || this.keys[68]) {
      // Right arrow or D to move sprite right
      this.player.move(DIRECTION.LEFT);
    }
  }
}