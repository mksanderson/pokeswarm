module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/images/graphics/*.svg')
			.pipe(plugins.plumber())
			.pipe(plugins.svgSymbols({
				className: '.graphic--%f',
				title: false,
				templates: ['default-svg']
			}))
			.pipe(gulp.dest('www/images/graphics/'))
			.pipe(plugins.browserSync.stream());
	}
}