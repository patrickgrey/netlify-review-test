const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { terser } = require("rollup-plugin-terser");
const json = require("@rollup/plugin-json");
const glob = require("fast-glob");
require("dotenv").config();

const source = process.env.COURSE_INPUT_FOLDER || "course-source";
const publish = process.env.COURSE_PRODUCTION_FOLDER || "course-publish";
const dev = process.env.NODE_ENV !== "production";

// Get all js files in course
// and return array of objects with
// Filenames and filepaths with filenames.
const entries = glob.sync([`${source}/**/*.js`, `!${source}/**/_data/*.js`], {
	dot: false,
	objectMode: true,
});

// Create array of correct outout paths
const outries = entries.map((entry) => {
	const withPubishDirectory = entry.path.replace(source, publish);
	const pathOnly = withPubishDirectory.substring(
		0,
		withPubishDirectory.length - entry.name.length
	);
	return pathOnly;
});

export default entries.map((entry, index) => ({
	input: entry.path,
	output: {
		name: "bundle",
		dir: outries[index],
		format: "umd",
	},
	plugins: [
		json(),
		babel({ babelHelpers: "bundled" }),
		nodeResolve({
			moduleDirectories: [`${source}/_shared`],
			// pass custom options to the resolve plugin
			// customResolveOptions: {
			// 	moduleDirectory: `${source}/_shared`,
			// },
		}),
		commonjs(),
		!dev && terser(),
	],
	watch: { clearScreen: false },
}));
