/*
    Typescript не умеет импротить произвольные файлы, это делает сборкщик (parcel)
    Для тайпчекера объявим, что модули с картинками - это нормально
*/

declare module "*.obj" {
	const value: string;
	export = value;
}

declare module "*.png" {
	const value: string;
	export = value;
}

declare module "*.jpg" {
	const value: string;
	export = value;
}
