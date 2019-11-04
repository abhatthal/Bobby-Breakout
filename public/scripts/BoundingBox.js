import { DegreesToRadians } from './helper_functions.js';

export class BoundingBox {
	constructor(group, shape, isVisible) {
		this.boundingArea = shape.getClientRect({ relativeTo: group });
		this.box = new Konva.Rect({
			x: this.boundingArea.x,
			y: this.boundingArea.y,
			width: this.boundingArea.width,
			height: this.boundingArea.height,
			stroke: 'cyan',
			strokeWidth: (isVisible) ? 5 : 0
		});
	}

	get boundingBox() {
		return this.box;
	}
}

export class VisionCone {
	constructor(group, shape) {
		this.boundingArea = shape.getClientRect({ relativeTo: group }); //edge of parent
		this.cone = new Konva.Wedge({
			x: this.boundingArea.x + this.boundingArea.width / 2,
			y: this.boundingArea.y + this.boundingArea.height,
			radius: 80,
			angle: 80,
			rotation: 50,
			stroke: 'black',
			strokeWidth: 4
		});

		this.startPoints = {
			x: this.boundingArea.x + this.boundingArea.width / 2, 
			y: this.boundingArea.y + this.boundingArea.height
		};

		this.feelerStart = new Konva.Line({
			points: [
				this.startPoints.x,
				this.startPoints.y,
				this.startPoints.x + this.cone.getAttr('radius') * Math.cos( DegreesToRadians(this.cone.getAttr('rotation')) ),
				this.startPoints.y + this.cone.getAttr('radius') * Math.sin( DegreesToRadians(this.cone.getAttr('rotation')) )
			],
			stroke: 'red',
			strokeWidth: 4
		});

		this.feelerMid = new Konva.Line({
			points: [
				this.startPoints.x,
				this.startPoints.y,
				this.startPoints.x + this.cone.getAttr('radius') * Math.cos( DegreesToRadians(this.cone.getAttr('rotation') + this.cone.getAttr('angle')/2) ),
				this.startPoints.y + this.cone.getAttr('radius') * Math.sin( DegreesToRadians(this.cone.getAttr('rotation') + this.cone.getAttr('angle')/2) )
			],
			stroke: 'red',
			strokeWidth: 4
		});

		this.feelerEnd =  new Konva.Line({
			points: [
				this.startPoints.x,
				this.startPoints.y,
				this.startPoints.x + this.cone.getAttr('radius') * Math.cos( DegreesToRadians(this.cone.getAttr('rotation') + this.cone.getAttr('angle')) ),
				this.startPoints.y + this.cone.getAttr('radius') * Math.sin( DegreesToRadians(this.cone.getAttr('rotation') + this.cone.getAttr('angle')) )
			],
			stroke: 'red',
			strokeWidth: 4
		});
	}

	get coneArea() {
		return this.cone;
	}

	get feelers(){
		return [this.feelerStart, this.feelerMid, this.feelerEnd];
	}
}