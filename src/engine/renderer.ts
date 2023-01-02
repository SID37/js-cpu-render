import { Texture } from "./model";

export class PointData {
	public x: number;
	public y: number;
	public z: number;

	public u: number;
	public v: number;

	public nx: number;
	public ny: number;
	public nz: number;

	constructor() {}

	public update(
		x: number, y: number, z: number,
		u: number, v: number,
		nx: number, ny: number, nz: number) {
		this.x = x | 0;
		this.y = y | 0;
		this.z = z;
		this.u = u;
		this.v = v;
		this.nx = nx;
		this.ny = ny;
		this.nz = nz;
	}
}


class Interpolate {
	public z: number;

	public u: number;
	public v: number;

	public nx: number;
	public ny: number;
	public nz: number;


	constructor() {}

	public update(data: PointData) {
		this.z = data.z;
		this.u = data.u;
		this.v = data.v;
		this.nx = data.nx;
		this.ny = data.ny;
		this.nz = data.nz;
	}

	public delta(A: Interpolate, B: Interpolate, dist: number) {
		const mult = 1 / dist;
		this.z = (B.z - A.z) * mult;
		this.u = (B.u - A.u) * mult;
		this.v = (B.v - A.v) * mult;
		this.nx = (B.nx - A.nx) * mult;
		this.ny = (B.ny - A.ny) * mult;
		this.nz = (B.nz - A.nz) * mult;
	}

	public add(inter: Interpolate) {
		this.z = this.z + inter.z;
		this.u = this.u + inter.u;
		this.v = this.v + inter.v;
		this.nx = this.nx + inter.nx;
		this.ny = this.ny + inter.ny;
		this.nz = this.nz + inter.nz;
	}

	public copy(inter: Interpolate) {
		this.z = inter.z;
		this.u = inter.u;
		this.v = inter.v;
		this.nx = inter.nx;
		this.ny = inter.ny;
		this.nz = inter.nz;
	}
}

export class PhongLight {
	public r;
	public g;
	public b;

	public vector: [number, number, number];

	private bakeIterations = 500;
	private bakedLight: number[];

	constructor(
		vector: [number, number, number],
		readonly color: number,
		public embient: number,
		public diffuse: number,
		public specular: number,
		public specularMult: number) {
			this.r = color & 0x0000ff;
			this.g = (color & 0x00ff00) >> 8;
			this.b = (color & 0xff0000) >> 16;
			this.rebakeSpecular(specular, specularMult);
			const len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
			this.vector = [vector[0] / len, vector[1] / len, vector[2] / len]
		}

		public rebakeSpecular(spec: number, mult: number) {
			this.specular = spec;
			this.specularMult = mult;
			this.bakedLight = [];
			for (let i = 0; i < this.bakeIterations; ++i) {
				this.bakedLight.push(Math.pow(i / this.bakeIterations, spec) * mult);
			}
		}

		public power(cos: number) {
			return this.bakedLight[(cos * this.bakeIterations) | 0];
		}
}


export class Renderer {
	readonly depth: Float32Array;
	private iUp1: Interpolate;
	private iUp2: Interpolate;
	private iDown1: Interpolate;
	private iDown2: Interpolate;
	private iDelta1: Interpolate;
	private iDelta2: Interpolate;

	constructor(
		readonly data: Uint32Array,
		readonly width: number,
		readonly height: number,
		public light: PhongLight)
	{
		this.width = width | 0;
		this.height = height | 0;
		this.depth = new Float32Array(width * height);
		this.iUp1 = new Interpolate();
		this.iUp2 = new Interpolate();
		this.iDown1 = new Interpolate();
		this.iDown2 = new Interpolate();
		this.iDelta1 = new Interpolate();
		this.iDelta2 = new Interpolate();
	}


	private inSqrt(x: number, y: number, z: number) {
		return 1 / Math.sqrt(x * x + y * y + z * z);
	}


	private phong(color: number, nx: number, ny: number, nz: number): number {
		let r = color & 0x0000ff;
		let g = (color & 0x00ff00) >> 8;
		let b = (color & 0xff0000) >> 16;

		const inquare = this.inSqrt(nx, ny, nz);
		nx *= inquare; ny *= inquare; nz *= inquare;

		const cos = nx * this.light.vector[0] + ny * this.light.vector[1] + nz * this.light.vector[2];
		const spec_cos = 2 * nz * cos - this.light.vector[2];
		const bake = cos < 0 ? 0 : cos;
		const spec_bake = spec_cos < 0 ? 0 : spec_cos;
		const embient = this.light.embient;
		const diffuse = bake * this.light.diffuse;
		// const specular = Math.pow(bake, this.light.specular) * this.light.specularMult;
		const specular = this.light.power(spec_bake);

		r = Math.min(255, (r * (embient + diffuse) + this.light.r * specular) | 0);
		g = Math.min(255, (g * (embient + diffuse) + this.light.g * specular) | 0);
		b = Math.min(255, (b * (embient + diffuse) + this.light.b * specular) | 0);

		return 0xff000000 | r | (g << 8) | (b << 16);
	}


	private drawTrapezoid(x1, x2, dx1, dx2, err1, err2, dy1, dy2, y, y1, texture: Texture) {
		const step1 = (dx1 / dy1) | 0;
		const step2 = (dx2 / dy2) | 0;
		const delta1 = dx1 % dy1;
		const delta2 = dx2 % dy2;

		let iUp1_z = this.iUp1.z;
		let iUp1_u = this.iUp1.u;
		let iUp1_v = this.iUp1.v;
		let iUp1_nx = this.iUp1.nx;
		let iUp1_ny = this.iUp1.ny;
		let iUp1_nz = this.iUp1.nz;

		let iUp2_z = this.iUp2.z;
		let iUp2_u = this.iUp2.u;
		let iUp2_v = this.iUp2.v;
		let iUp2_nx = this.iUp2.nx;
		let iUp2_ny = this.iUp2.ny;
		let iUp2_nz = this.iUp2.nz;

		let iDelta1_z = this.iDelta1.z;
		let iDelta1_u = this.iDelta1.u;
		let iDelta1_v = this.iDelta1.v;
		let iDelta1_nx = this.iDelta1.nx;
		let iDelta1_ny = this.iDelta1.ny;
		let iDelta1_nz = this.iDelta1.nz;

		let iDelta2_z = this.iDelta2.z;
		let iDelta2_u = this.iDelta2.u;
		let iDelta2_v = this.iDelta2.v;
		let iDelta2_nx = this.iDelta2.nx;
		let iDelta2_ny = this.iDelta2.ny;
		let iDelta2_nz = this.iDelta2.nz;


		let base = y * this.width;
		for (; y < y1; ++y) {
			const dim = 1 / (x2 - x1);
			const iStep_z = (iUp2_z - iUp1_z) * dim;
			const iStep_u = (iUp2_u - iUp1_u) * dim;
			const iStep_v = (iUp2_v - iUp1_v) * dim;
			const iStep_nx = (iUp2_nx - iUp1_nx) * dim;
			const iStep_ny = (iUp2_ny - iUp1_ny) * dim;
			const iStep_nz = (iUp2_nz - iUp1_nz) * dim;

			let z = iUp1_z;
			let u = iUp1_u;
			let v = iUp1_v;
			let nx = iUp1_nx;
			let ny = iUp1_ny;
			let nz = iUp1_nz;

			if (y >= 0 && y < this.height) {
				for (let i = Math.max(x1, 0); i < Math.min(x2, this.width - 1); ++i) {
					z += iStep_z;
					u += iStep_u;
					v += iStep_v;
					nx += iStep_nx;
					ny += iStep_ny;
					nz += iStep_nz;
					const index = base + i;
					if (z > this.depth[index]) {
						this.depth[index] = z;
						const m = texture.getPuxel(u, v);
						this.data[index] = this.phong(m, nx, ny, nz);
					}
				}
			}
			x1 += step1;
			x2 += step2;
			err1 += delta1;
			err2 += delta2;
			base += this.width;
			if (Math.abs(err1) >= dy1) {
				x1 += Math.sign(dx1);
				err1 -= dy1 * Math.sign(delta1);
			}
			if (Math.abs(err2) >= dy2) {
				x2 += Math.sign(dx2);
				err2 -= dy2 * Math.sign(delta2);
			}
			iUp1_z += iDelta1_z;
			iUp1_u += iDelta1_u;
			iUp1_v += iDelta1_v;
			iUp1_nx += iDelta1_nx;
			iUp1_ny += iDelta1_ny;
			iUp1_nz += iDelta1_nz;

			iUp2_z += iDelta2_z;
			iUp2_u += iDelta2_u;
			iUp2_v += iDelta2_v;
			iUp2_nx += iDelta2_nx;
			iUp2_ny += iDelta2_ny;
			iUp2_nz += iDelta2_nz;
		}

		this.iUp1.z = iUp1_z;
		this.iUp1.u = iUp1_u;
		this.iUp1.v = iUp1_v;
		this.iUp1.nx = iUp1_nx;
		this.iUp1.ny = iUp1_ny;
		this.iUp1.nz = iUp1_nz;

		this.iUp2.z = iUp2_z;
		this.iUp2.u = iUp2_u;
		this.iUp2.v = iUp2_v;
		this.iUp2.nx = iUp2_nx;
		this.iUp2.ny = iUp2_ny;
		this.iUp2.nz = iUp2_nz;
		return [x1, x2, err1, err2]
	}


	rawDrawTriangle(p1: PointData, p2: PointData, p3: PointData, texture: Texture) {
		if (p2.y < p1.y && p2.y <= p3.y) { const b = p1; p1 = p2; p2 = p3; p3 = b; } else
		if (p3.y < p1.y && p3.y <= p2.y) { const b = p1; p1 = p3; p3 = p2, p2 = b; }

		const dx2 = p2.x - p1.x; const dy2 = p2.y - p1.y;
		const dx3 = p3.x - p1.x; const dy3 = p3.y - p1.y;

		this.iUp1.update(p1);
		this.iDown1.update(p3);
		this.iDelta1.delta(this.iUp1, this.iDown1, dy3);

		this.iUp2.update(p1);
		this.iDown2.update(p2);
		this.iDelta2.delta(this.iUp2, this.iDown2, dy2);

		const [new_x1, new_x2, err1, err2] = this.drawTrapezoid(p1.x, p1.x, dx3, dx2, 0, 0, dy3, dy2, p1.y, Math.min(p2.y, p3.y), texture);
		if (p2.y < p3.y) {
			this.iUp2.update(p2);
			this.iDown2.update(p3);
			this.iDelta2.delta(this.iUp2, this.iDown2, p3.y - p2.y);
			this.drawTrapezoid(new_x1, p2.x, dx3, p3.x - p2.x, err1, 0, dy3, p3.y - p2.y, p2.y, p3.y, texture);
		} else {
			this.iUp1.update(p3);
			this.iDown1.update(p2);
			this.iDelta1.delta(this.iUp1, this.iDown1, p2.y - p3.y);
			this.drawTrapezoid(p3.x, new_x2, p2.x - p3.x, dx2, 0, err2, p2.y - p3.y, dy2, p3.y, p2.y, texture);
		}
	}


	//                    //
	//     1 ------- 2    //
	//      \       /     //
	//       \     /      //
	//        \   /       //
	//          3         //
	//                    //
	public drawTriangle(p1: PointData, p2: PointData, p3: PointData, texture: Texture) {
		const s = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
		if (s < 0) return;
		this.rawDrawTriangle(p1, p2, p3, texture);
	}

	public clear(color: number = 0, depth: number = -1e10) {
		this.data.fill(color);
		this.depth.fill(depth);
	}
}
