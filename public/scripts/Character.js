import {Entity} from './Entity.js';
import {DIRECTION, httpGet} from './helper_functions.js';
import {VisionCone} from './BoundingBox.js';
import {Wall} from './Wall.js';
// import {Skills} from './Skills.js';
// import * as defaultskill from './skilldefault.js';

export class Character extends Entity {
  constructor(data) {
    super(data);
    this.speed = 5; // movement speed
    this.fightSpeed = 0; // for fight priority
    this.skillA1 = null; // defaultskill.Skill1;
    this.enableFace = (data.enableFace) ? data.enableFace : false;
    // Draw a face using fork off cool-ascii-faces web service
    // https://github.com/abhatthal/cool-face-service
    const text = httpGet('https://fathomless-temple-39382.herokuapp.com/?max_face_length=10');
    this.face = new Konva.Text({
      x: -18,
      y: -10,
      text: (text.length < 12) ? text : '( ﾟヮﾟ)', // ensure we get a face that fits
      fontSize: 16,
      fill: '#555',
      padding: 20,
      align: 'center',
    });
    if (this.enableFace) {
      this.group.add(this.face);
    }
  }

  move(dir) {
    switch (dir) {
      case DIRECTION.LEFT:
        this.x += this.speed * DIRECTION.UNIT_LEFT;
        this.group.x(this.x);
        break;
      case DIRECTION.RIGHT:
        this.x += this.speed * DIRECTION.UNIT_RIGHT;
        this.group.x(this.x);
        break;
      case DIRECTION.UP:
        this.y += this.speed * DIRECTION.UNIT_UP;
        this.group.y(this.y);
        break;
      case DIRECTION.DOWN:
        this.y += this.speed * DIRECTION.UNIT_DOWN;
        this.group.y(this.y);
        break;
    }
  }

  get speed() {
    return this._speed;
  }

  get fightSpeed() {
    return this._fightSpeed;
  }

  get skillA1() {
    return this._skillA1;
  }

  set speed(val) {
    this._speed = val;
  }

  set fightSpeed(val) {
    this._fightSpeed = val;
  }

  set skillA1(val) {
    this._skillA1 = val;
  }
}

export class Player extends Character {
  constructor(data) {
    super(data);
  }

  checkCollision(obj) { // block array of Environment objects
    if (this.isColliding(obj) ) {
      if (obj instanceof Wall) {
        // console.log('i am touching a Wall', obj.id);
        // bruno add the wall stuff here
        // ...
      } else if (obj instanceof NPC) {
        // console.log('i am touching an NPC', obj.id);
      }
      return true;
    } else {
      return false;
    }
  }
}

export class NPC extends Character {
  constructor(data) {
    super(data);
    this.friendly = data.friendly; // bool
    this.orientation = DIRECTION.LEFT;
    this.impassible = data.impassible || false;

    this.visionCone = new VisionCone(this.group, this.shape);
    this.coneArea = this.visionCone.coneArea;
    this.tempRectArea = this.visionCone.coneBindingArea;
    this.visionConeAttr = this.coneArea.getAttrs();

    this.group.add(this.coneArea);
    this.group.add(this.tempRectArea);

    this.feelers = this.visionCone.feelers;
    this.feelers.forEach((feeler) => {
      this.group.add(feeler);
    });
  }

  get impassible() {
    return this._impassible;
  }

  set impassible(val) {
    this._impassible = val;
  }

  isSeeing(obj) {
    // console.log(this.tempRectArea);
    // console.log(this.tempRectArea.absolutePosition());

    const tempRectGlobalPos = this.tempRectArea.absolutePosition();
    return !(obj.x > tempRectGlobalPos.x + this.tempRectArea.attrs.width ||
      obj.x + obj.width < tempRectGlobalPos.x ||
      obj.y > tempRectGlobalPos.y + this.tempRectArea.attrs.height ||
      obj.y + obj.height < tempRectGlobalPos.y);
  }

  checkPlayerDetection(player) {
    if (this.isSeeing(player) && player instanceof Player) {
      // console.log('i see the player');
      return true;
    } else {
      return false;
    }
  }
}