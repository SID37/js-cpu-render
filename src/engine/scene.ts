import { Point3Float32Array, Vector3Float32Array } from "./arrays";
import { PointData, Renderer } from "./renderer";
import { RenderObject } from "./render_object";


export class Scene {
	public objects: RenderObject[];
	private vertexBuf: Point3Float32Array;
	private normalBuf: Vector3Float32Array;


	constructor(public renderer: Renderer) {
		this.vertexBuf = new Point3Float32Array(new Float32Array(65536));
		this.normalBuf = new Vector3Float32Array(new Float32Array(65536));
		this.objects = [];
	}


	public pushObject(object: RenderObject) {
		this.objects.push(object);
	}


	public draw(clearColor: number = 0xff000000) {
		this.renderer.clear(clearColor);
		this.objects.forEach(o => this.drawObject(o));
	}


	private drawObject(object: RenderObject) {
		const model = object.model;
		const texture = object.texture;
		if (this.vertexBuf.length() < model.vertexes.length()) {
			this.vertexBuf = new Point3Float32Array(new Float32Array(model.vertexes.data.length));
		}

		if (this.normalBuf.length() < model.normals.length()) {
			this.normalBuf = new Vector3Float32Array(new Float32Array(model.normals.data.length));
		}

		model.vertexes.transformTo(object.transform.matrix(), this.vertexBuf);
		model.normals.transformTo(object.transform.rotationMatrix(), this.normalBuf);

		const i0 = new PointData();
		const i1 = new PointData();
		const i2 = new PointData();

		for (let i = 0; i < model.length(); ++i) {
			const t = model.triangles.get(i)
			const n = model.normalIndexes.get(i)

			const p0 = this.vertexBuf.get(t[0]);
			const p1 = this.vertexBuf.get(t[1]);
			const p2 = this.vertexBuf.get(t[2]);
	
			const n0 = this.normalBuf.get(n[0]);
			const n1 = this.normalBuf.get(n[1]);
			const n2 = this.normalBuf.get(n[2]);
	
			const vt = model.getTexture(i);
	
			i0.update(p0[0], p0[1], p0[2], vt[0], vt[1], n0[0], n0[1], n0[2]);
			i1.update(p1[0], p1[1], p1[2], vt[2], vt[3], n1[0], n1[1], n1[2]);
			i2.update(p2[0], p2[1], p2[2], vt[4], vt[5], n2[0], n2[1], n2[2]);
	
			this.renderer.drawTriangle(i0, i1, i2, texture);
		}
	}
}
