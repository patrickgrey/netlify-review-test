require("dotenv").config();

const source = process.env.COURSE_INPUT_FOLDER || "course";

module.exports = {
	mode: "jit",
	purge: [`./${source}/**/*.html`, "index.njk"],
	darkMode: false, // or 'media' or 'class'
	theme: {
		screens: {
			md: "720px",
			lg: "1024px",
			// => @media (min-width: 720px) { ... }
		},
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
