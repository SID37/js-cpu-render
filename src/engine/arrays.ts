export class Matrix {
	private constructor(readonly data: number[]) {
	}

	public static Zero() {
		return new Matrix([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
		]);
	}

	public static Ident() {
		return new Matrix([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		]);
	}

	public static RotateX(sin: number, cos: number) {
		return new Matrix([
			1,  0, 0, 0,
			0,  cos, sin, 0,
			0, -sin, cos, 0,
			0,  0, 0, 1,
		]);
	}

	public static RotateY(sin: number, cos: number) {
		return new Matrix([
			cos, 0, -sin, 0,
			0,   1,  0,   0,
			sin, 0,  cos, 0,
			0,   0,  0,   1,
		]);
	}

	public static RotateZ(sin: number, cos: number) {
		return new Matrix([
			 cos, sin, 0, 0,
			-sin, cos, 0, 0,
			 0, 0, 1, 0,
			 0, 0, 0, 1,
		]);
	}

	public static RotateAngleX(angle: number) {
		return this.RotateX(Math.sin(angle), Math.cos(angle));
	}

	public static RotateAngleY(angle: number) {
		return this.RotateY(Math.sin(angle), Math.cos(angle));
	}

	public static RotateAngleZ(angle: number) {
		return this.RotateZ(Math.sin(angle), Math.cos(angle));
	}

	public static Move(x: number, y: number, z: number) {
		return new Matrix([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1,
		]);
	}

	public static Scale(x: number, y: number, z: number) {
		return new Matrix([
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1,
		]);
	}

	public Mult(m: Matrix) {
		const res = Matrix.Zero();
		for (let i = 0; i < 4; ++i)
			for (let j = 0; j < 4; ++j)
				for (let k = 0; k < 4; ++k)
					res.data[i + j * 4] = (res.data[i + j * 4] + (this.data[k + j * 4] * m.data[i + k * 4]));
		return res;
	}
}


export class Point3Float32Array {
	constructor(readonly data: Float32Array) {
	}

	public get(i: number): [number, number, number] {
		const d = this.data;
		const base = i * 3;
		return [d[base], d[base + 1], d[base + 2]]
	}

	public set(i: number, value: [number, number, number]) {
		const d = this.data;
		const base = i * 3;
		d[base    ] = value[0];
		d[base + 1] = value[1];
		d[base + 2] = value[2];
	}

	public length() {
		return this.data.length / 3;
	}

	public transformTo(matrix: Matrix, dest: Point3Float32Array) {
		const src = this.data;
		const dst = dest.data;
		const m = matrix.data;
		for (let i = 0; i < src.length; i += 3) {
			const x = src[i];
			const y = src[i + 1];
			const z = src[i + 2];
			const delm =  x * m[3] + y * m[7] + z * m[11] + m[15];
			dst[i    ] = (x * m[0] + y * m[4] + z * m[ 8] + m[12]) / delm;
			dst[i + 1] = (x * m[1] + y * m[5] + z * m[ 9] + m[13]) / delm;
			dst[i + 2] = (x * m[2] + y * m[6] + z * m[10] + m[14]) / delm;
		}
	}
}

export class Vector3Float32Array {
	constructor(readonly data: Float32Array) {
	}

	public get(i: number): [number, number, number] {
		const d = this.data;
		const base = i * 3;
		return [d[base], d[base + 1], d[base + 2]]
	}

	public set(i: number, value: [number, number, number]) {
		const d = this.data;
		const base = i * 3;
		d[base    ] = value[0];
		d[base + 1] = value[1];
		d[base + 2] = value[2];
	}

	public length() {
		return this.data.length / 3;
	}

	public transformTo(matrix: Matrix, dest: Vector3Float32Array) {
		const src = this.data;
		const dst = dest.data;
		const m = matrix.data;
		for (let i = 0; i < src.length; i += 3) {
			const x = src[i];
			const y = src[i + 1];
			const z = src[i + 2];
			dst[i    ] = x * m[0] + y * m[4] + z * m[ 8];
			dst[i + 1] = x * m[1] + y * m[5] + z * m[ 9];
			dst[i + 2] = x * m[2] + y * m[6] + z * m[10];
		}
	}

	public scale(s: number) {
		for (let i = 0; i < this.data.length; i += 1) {
			this.data[i] = this.data[i] * s;
		}
	}
}


export class Vector2Float32Array {
	constructor(readonly data: Float32Array) {
	}

	public get(i: number): [number, number] {
		const d = this.data;
		const base = i * 2;
		return [d[base], d[base + 1]]
	}

	public set(i: number, value: [number, number]) {
		const d = this.data;
		const base = i * 2;
		d[base    ] = value[0];
		d[base + 1] = value[1];
	}

	public length() {
		return this.data.length / 2;
	}
}


export class Vector3Uint32Array {
	constructor(readonly data: Uint32Array) {
	}

	get(i: number): [number, number, number] {
		const d = this.data;
		const base = i * 3;
		return [d[base], d[base + 1], d[base + 2]]
	}

	public length() {
		return this.data.length / 3;
	}

	set(i: number, value: [number, number, number]) {
		const d = this.data;
		const base = i * 3;
		d[base    ] = value[0];
		d[base + 1] = value[1];
		d[base + 2] = value[2];
	}
}
