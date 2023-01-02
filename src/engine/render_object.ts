import { Matrix } from "./arrays";
import { Model, Texture } from "./model";


export class Transform {
	constructor(
		public x: number,
		public y: number,
		public z: number,
		public rotationX: number,
		public rotationY: number,
		public rotationZ: number,
		public scaleX: number,
		public scaleY: number,
		public scaleZ: number,
		public parent: Transform | null = null,
	) { }

	public static Shift(x: number, y: number, z: number, parent: Transform | null = null) {
		return new Transform(x, y, z, 0, 0, 0, 1, 1, 1, parent);
	}

	public static Rotation(x: number, y: number, z: number, parent: Transform | null = null) {
		return new Transform(0, 0, 0, x, y, z, 1, 1, 1, parent);
	}

	public static Scale(x: number, y: number, z: number, parent: Transform | null = null) {
		return new Transform(0, 0, 0, 0, 0, 0, x, y, z, parent);
	}

	public static Empty(parent: Transform | null = null) {
		return new Transform(0, 0, 0, 0, 0, 0, 1, 1, 1, parent);
	}

	public matrix(): Matrix {
		const matrix = Matrix.Ident()
			.Mult(Matrix.Scale(this.scaleX, this.scaleY, this.scaleZ))
			.Mult(Matrix.RotateAngleZ(this.rotationZ))
			.Mult(Matrix.RotateAngleX(this.rotationX))
			.Mult(Matrix.RotateAngleY(this.rotationY))
			.Mult(Matrix.Move(this.x, this.y, this.z));

		if (this.parent)
			return matrix.Mult(this.parent.matrix());
		return matrix;
	}

	public inverseMatrix(): Matrix {
		const matrix = Matrix.Ident()
			.Mult(Matrix.Move(-this.x, -this.y, -this.z))
			.Mult(Matrix.RotateAngleY(-this.rotationY))
			.Mult(Matrix.RotateAngleX(-this.rotationX))
			.Mult(Matrix.RotateAngleZ(-this.rotationZ))
			.Mult(Matrix.Scale(1 / this.scaleX, 1 / this.scaleY, 1 / this.scaleZ));

		if (this.parent)
			return this.parent.inverseMatrix().Mult(matrix);
		return matrix;
	}

	public rotationMatrix(): Matrix {
		const matrix = Matrix.Ident()
			.Mult(Matrix.RotateAngleZ(this.rotationZ))
			.Mult(Matrix.RotateAngleX(this.rotationX))
			.Mult(Matrix.RotateAngleY(this.rotationY));

		if (this.parent)
			return matrix.Mult(this.parent.rotationMatrix());
		return matrix;
	}

	public inverseRotationMatrix(): Matrix {
		const matrix = Matrix.Ident()
			.Mult(Matrix.RotateAngleY(-this.rotationY))
			.Mult(Matrix.RotateAngleX(-this.rotationX))
			.Mult(Matrix.RotateAngleZ(-this.rotationZ));

		if (this.parent)
			return this.parent.inverseRotationMatrix().Mult(matrix);
		return matrix;
	}
}


export class RenderObject {
	constructor(
		public texture: Texture,
		public model: Model,
		public transform: Transform = Transform.Empty()
	) { }
}
