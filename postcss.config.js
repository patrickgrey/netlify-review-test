module.exports = ({ env }) => ({
	plugins: {
		"postcss-nested": {},
		tailwindcss: {},
		autoprefixer: {},
		cssnano:
			env === "production"
				? {
						preset: ["default", { discardComments: { removeAll: true } }],
				  }
				: false,
	},
});
