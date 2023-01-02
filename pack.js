const glob = require("glob");
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { exit } = require("process");


if (process.argv.includes("-h") || process.argv.length < 4) {
	console.log("node pack.js <source_dir> <outputFile_file>");
	console.log("    source_dir   -  directory with .js files");
	console.log("    outputFile_file  -  outputFile .js file");
	exit()
}

const dirname = process.argv[2]
const outputFile = process.argv[3]

let res = "";
glob(path.join(dirname, '/**/*.js').replaceAll('\\', '/'), (err, files) => {
	if (err) {
		console.log(`read files error: ${err}`)
		return;
	}

	let counter = files.length;
	files.forEach((file) => {
		fs.readFile(file, {encoding: 'utf-8'}, (err, data) => {
			if (err) {
				console.err(err);
				return;
			}

			const placeholder = "\n\n//============== ${file} ==============//\n\n";
			if (/\/\/\s*\$PACK:\s*EXECUTABLE/.test(data))
				res = `${res}${placeholder}${data}`;
			else
				res = `${placeholder}${data}${res}`;

			counter -= 1;
			if (counter != 0)
				return;

			res = res.replaceAll(/import.*/g, "")
			res = res.replaceAll(/export /g, "")
			fs.writeFile(outputFile, res, (err) => {
				if (err) console.error(err);
			});
		});
	})
});
