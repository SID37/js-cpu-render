import { PhongLight, Renderer } from "./engine/renderer";
import { RenderObject, Transform } from "./engine/render_object";
import { Scene } from "./engine/scene";
import { ObjModel, UrlTexture } from "./engine/model";

import skullObj from "../models/Skull.obj"
import skullTexture from "../models/skull.jpg"



let canvas = document.querySelector("canvas")!;

const width = 900
const height = 900

canvas.width = width;
canvas.height = height;

const context = canvas.getContext("2d")!
const img = context.createImageData(width, height)!
const data = new Uint32Array(img.data.buffer);


const scale = 25;
const transform = Transform.Shift(450, 800, 0);
const skull = new RenderObject(new UrlTexture(skullTexture).texture, new ObjModel(skullObj).model,
	Transform.Rotation(Math.PI / 2, 0, Math.PI,
	Transform.Scale(scale, scale, scale,
	transform))
);

const renderer = new Renderer(data, width, height, new PhongLight([0.4, 0, 0.3], 0x00ffffff, 0.1, 0.6, 20, 1));
const scene = new Scene(renderer);
scene.pushObject(skull);


const timerStep = 100;
let lastTime = 0;
let timeCounter = timerStep;
const f = t => {
	timeCounter += 1;
	if (timeCounter >= timerStep) {
		timeCounter = 0;
		console.log("fps = " + (1000 * timerStep / (t - lastTime)));
		lastTime = t;
	}
	// ##################

	transform.rotationY = t / 3000;
	scene.draw();

	// ##################
	context.putImageData(img, 0, 0);
	requestAnimationFrame(f);
}
requestAnimationFrame(f)


