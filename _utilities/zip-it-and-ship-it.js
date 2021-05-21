const fs = require("fs");
const dirTree = require("directory-tree");
const AdmZip = require("adm-zip");
require("dotenv").config();

const source = process.env.COURSE_PUTPUT_FOLDER || "course-publish";
const filteredTree = dirTree(source, {
	extensions: /\.html/,
	exclude: /_data/,
});

const traverse = function (o, fn, scope = []) {
	for (let i in o) {
		fn.apply(this, [i, o[i], scope]);
		if (o[i] !== null && typeof o[i] === "object") {
			traverse(o[i], fn, scope.concat(i));
		}
	}
};

let pathArray = [];
let previousPath = "";

traverse(filteredTree, (key, value, scope) => {
	if (key === "path") {
		previousPath = value;
	}
	if (key === "extension" && value === ".html") {
		pathArray.push(previousPath);
	}
});

pathArray.splice(pathArray.indexOf(`${source}\\_web-page-template`), 1);
pathArray.splice(pathArray.indexOf(`${source}\\index.html`), 1);

const zipArray = pathArray.map((item) => {
	const splitPath = item.split("\\");
	// Remove index page
	splitPath.pop();
	const path = "./" + splitPath.join("/");

	const zipPath = path + `/${splitPath[splitPath.length - 1]}.zip`;

	console.log("Creating: " + zipPath);

	const zipFile = new AdmZip();

	zipFile.addLocalFolder(path);
	zipFile.writeZip(zipPath);

	return path;
});
