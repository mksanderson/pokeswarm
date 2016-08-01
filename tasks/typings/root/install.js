module.exports = function (gulp, plugins) {
	return function () {
		return gulp.src(['typings.json'])
			.pipe(plugins.typings())
			.pipe(gulp.dest('typings'))
	}
}