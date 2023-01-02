import { Vector2Float32Array, Point3Float32Array, Vector3Uint32Array, Vector3Float32Array } from "./arrays";

export class Model {
	constructor(
		public vertexes: Point3Float32Array,
		public normals: Vector3Float32Array,
		public textures: Vector2Float32Array,
		public triangles: Vector3Uint32Array,
		public normalIndexes: Vector3Uint32Array
	) { }

	public length() {
		return this.triangles.length();
	}

	public getTexture(triangle: number) {
		return [
			this.textures.data[triangle * 6 + 0],
			this.textures.data[triangle * 6 + 1],
			this.textures.data[triangle * 6 + 2],
			this.textures.data[triangle * 6 + 3],
			this.textures.data[triangle * 6 + 4],
			this.textures.data[triangle * 6 + 5],
		]
	}
}


export class Texture {
	constructor(
		public data: Uint32Array,
		public width: number,
		public height: number
	) {
		this.update(data, width, height);
	}

	public update(data: Uint32Array, width: number, height: number) {
		this.data = data;
		this.width = width | 0;
		this.height = height | 0;
	}

	public getPuxel(u: number, v: number): number {
		return this.data[(u * this.width) | 0 + ((v * this.height) | 0) * this.width]
	}
}


export class ObjModel {
	public model: Model;

	constructor(objFile: string) {
		fetch(objFile)
		.then(v => v.text())
		.then(v => this.load(v))
		.catch(e => console.error(`cant load file ${objFile}: ${e}`))
		this.model = new Model(
			new Point3Float32Array(new Float32Array(0)),
			new Vector3Float32Array(new Float32Array(0)),
			new Vector2Float32Array(new Float32Array(0)),
			new Vector3Uint32Array(new Uint32Array(0)),
			new Vector3Uint32Array(new Uint32Array(0)),
		);
	}

	private load(objData: string) {
		const vertexes: number[] = [];
		const normals: number[] = [];
		const textures: number[] = [];
		const texturePack: number[] = [];
		const triangles: number[] = [];
		const normalIndexes: number[] = [];

		objData.split("\n").map(line => {
			const tokens = line.trim().split(" ").filter(Boolean)
			if (tokens.length == 0) return;
			switch (tokens[0]) {
				case "v":
					vertexes.push(+tokens[1]);
					vertexes.push(+tokens[2]);
					vertexes.push(+tokens[3]);
				break;
				case "vn":
					normals.push(+tokens[1]);
					normals.push(+tokens[2]);
					normals.push(+tokens[3]);
				break;
				case "vt":
					textures.push(+tokens[1]);
					textures.push(+tokens[2]);
				break;
				case "f":
					const p1 = tokens[1].split("/");
					for (let i = 3; i < tokens.length; ++i) {
						const p2 = tokens[i - 1].split("/");
						const p3 = tokens[i].split("/");

						triangles.push((+p1[0] - 1) | 0);
						triangles.push((+p2[0] - 1) | 0);
						triangles.push((+p3[0] - 1) | 0);

						normalIndexes.push((+p1[2] - 1) | 0);
						normalIndexes.push((+p2[2] - 1) | 0);
						normalIndexes.push((+p3[2] - 1) | 0);

						texturePack.push(textures[((+p1[1] - 1) | 0) * 2])
						texturePack.push(1 - textures[((+p1[1] - 1) | 0) * 2 + 1])
						texturePack.push(textures[((+p2[1] - 1) | 0) * 2])
						texturePack.push(1 - textures[((+p2[1] - 1) | 0) * 2 + 1])
						texturePack.push(textures[((+p3[1] - 1) | 0) * 2])
						texturePack.push(1 - textures[((+p3[1] - 1) | 0) * 2 + 1])
					}
				break;
			}
		})
		this.model.vertexes = new Point3Float32Array(new Float32Array(vertexes));
		this.model.normals = new Vector3Float32Array(new Float32Array(normals));
		this.model.textures = new Vector2Float32Array(new Float32Array(texturePack));
		this.model.triangles = new Vector3Uint32Array(new Uint32Array(triangles));
		this.model.normalIndexes = new Vector3Uint32Array(new Uint32Array(normalIndexes));
	}
}


export class UrlTexture {
	public texture: Texture;

	constructor(url: string) {
		let img = new Image();
		img.crossOrigin = 'anonymous'
		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = img.width;
			canvas.height = img.height;
			const context = canvas.getContext('2d')!;
			context.drawImage(img, 0, 0);
			this.texture.update(
				new Uint32Array(context.getImageData(0, 0, img.width, img.height).data.buffer),
				img.width, img.height,
			);
		};
		img.onerror = () => {
			console.error(`cant load image ${url}`)
		};
		img.src = url;

		this.texture = new Texture(new Uint32Array([0xff00ff00]), 1, 1);
	}
}
