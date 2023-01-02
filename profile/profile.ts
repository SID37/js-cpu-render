// $PACK: EXECUTABLE

import { PhongLight, Renderer } from "../src/engine/renderer";
import { RenderObject, Transform } from "../src/engine/render_object";
import { Scene } from "../src/engine/scene";
import { Model, Texture } from "../src/engine/model";
import { Vector2Float32Array, Point3Float32Array, Vector3Uint32Array, Vector3Float32Array } from "../src/engine/arrays";

import { skullTexture } from "./skullTexture"
import { skullModel } from "./skullModel"


const width = 900
const height = 900

const data = new Uint32Array(width * height);

const scale = 25;
const transform = Transform.Shift(450, 800, 0);
const skull = new RenderObject(
	new Texture(
		new Uint32Array(skullTexture.data),
		skullTexture.width,
		skullTexture.height,
	),
	new Model(
		new Point3Float32Array(new Float32Array(skullModel.vertexes)),
		new Vector3Float32Array(new Float32Array(skullModel.normals)),
		new Vector2Float32Array(new Float32Array(skullModel.textures)),
		new Vector3Uint32Array(new Uint32Array(skullModel.triangles)),
		new Vector3Uint32Array(new Uint32Array(skullModel.normalIndexes))
	),
	Transform.Rotation(Math.PI / 2, 0, Math.PI,
	Transform.Scale(scale, scale, scale,
	transform))
);

const renderer = new Renderer(data, width, height, new PhongLight([0.4, 0, 0.3], 0x00ffffff, 0.1, 0.6, 20, 1));
const scene = new Scene(renderer);
scene.pushObject(skull);


for (let i = 0; i < 1000; ++i) {
	if (i % 100 == 0)
		console.log(`iteration: ${i}`);
	scene.draw();
}

