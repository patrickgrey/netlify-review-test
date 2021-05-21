require("dotenv").config();
const path = require("path");
const Image = require("@11ty/eleventy-img");
const fs = require("fs");
const CleanCSS = require("clean-css");

const source = process.env.COURSE_INPUT_FOLDER || "course-source";
const publish = process.env.COURSE_PRODUCTION_FOLDER || "course-publish";

function coreStyles() {
	let code = fs.readFileSync(
		`./${publish}/_shared/_styleguide/ians-styleguide.css`,
		"utf8"
	);
	code += fs.readFileSync(`./${publish}/_shared/_shared.css`, "utf8");
	const minified = new CleanCSS({}).minify(code).styles;
	return minified;
}

function imageShortcode(src, alt, cls, sizes, widths, formats) {
	if (!alt) {
		throw new Error(`Missing \`alt\` on image from: ${src}`);
	}

	const imagePath = path.dirname(src);
	const urlPath = imagePath + "/";
	const outputDir = "./" + publish + this.page.url + imagePath + "/";
	const imageSource = "./" + publish + this.page.url + src;

	// console.log(urlPath);
	// console.log(outputDir);
	// console.log(imageSource);

	// return;

	const sizesString = sizes || `(max-width: 2400px) 100vw, 2400px`;

	let options = {
		widths: widths || [320, 640, 960, 1200, 1800, 2400],
		formats: formats || ["avif", "webp", "jpeg"],
		urlPath: urlPath,
		outputDir: outputDir,
	};

	// generate images, while this is async we don’t wait
	Image(imageSource, options);

	let imageAttributes = {
		class: cls || "",
		alt,
		sizes: sizesString,
		loading: "lazy",
		// decoding: "async",
	};
	// get metadata even the images are not fully generated
	metadata = Image.statsSync(imageSource, options);
	// console.log(metadata);
	const html = Image.generateHTML(metadata, imageAttributes);
	// console.log(html);
	return html;
}

module.exports = function (eleventyConfig) {
	eleventyConfig.setDataDeepMerge(true);

	eleventyConfig.addPassthroughCopy(`${source}/index.css`);
	eleventyConfig.addPassthroughCopy(`${source}/**/*.jpg`);
	eleventyConfig.addPassthroughCopy(`${source}/**/*.png`);
	eleventyConfig.addPassthroughCopy(`${source}/**/*.svg`);
	eleventyConfig.addPassthroughCopy(`${source}/**/*.webp`);
	eleventyConfig.addPassthroughCopy(`${source}/**/*.avif`);

	eleventyConfig.addWatchTarget(`./${source}/index.css`);
	eleventyConfig.addWatchTarget(`./${source}/**/*.css`);
	eleventyConfig.addWatchTarget(`./${source}/**/*.js`);

	// eleventyConfig.addFilter("cssmin", function (code) {
	// 	return new CleanCSS({}).minify(code).styles;
	// });

	eleventyConfig.setWatchJavaScriptDependencies(false);

	// Browsersync Overrides
	eleventyConfig.setBrowserSyncConfig({
		files: [`${publish}/**/*.css`, `${publish}/**/*.js`],
		ui: false,
		reloadOnRestart: true,
		open: false,
		ghostMode: false,
	});

	// SHORTCODES

	eleventyConfig.addNunjucksShortcode("test", function (returnString) {
		const imagePath = path.dirname(returnString);
		return "." + this.page.url + imagePath + "/";
	});

	eleventyConfig.addNunjucksShortcode("image", imageShortcode);
	eleventyConfig.addNunjucksShortcode("coreStyles", coreStyles);

	eleventyConfig.addNunjucksShortcode("video", function (id) {
		return `<div class="ians-video-16-9">
		<iframe
			src="https://www.youtube.com/embed/${id}?rel=0&showinfo=0"
			loading="lazy"
			frameborder="0"
			allowfullscreen
			title="Youtube video"
		></iframe>
	</div>`;
	});

	eleventyConfig.addNunjucksShortcode("lmsBanner", function () {
		let html = ``;
		if (process.env.NODE_ENV === "development") {
			html = `<div class="ians-lms-banner">
		<a href="/index.html">&lt;&lt; Back</a>
	</div>`;
		}
		return html;
	});

	return {
		templateFormats: ["njk", "html"],

		// If your site lives in a different subdirectory, change this.
		// Leading or trailing slashes are all normalized away, so don’t worry about those.

		// If you don’t have a subdirectory, use "" or "/" (they do the same thing)
		// This is only used for link URLs (it does not affect your file structure)
		// Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

		// You can also pass this in on the command line using `--pathprefix`
		// pathPrefix: "/",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",

		// These are all optional, defaults are shown:
		dir: {
			input: source,
			output: publish,
			data: "../_utilities/_data",
			includes: "../_utilities/_includes",
		},
	};
};
