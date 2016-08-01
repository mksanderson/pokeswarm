module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch([
			'source/components/**/*.ts',
			'source/configuration/**/*.ts',
			'source/controllers/**/*.ts',
			'source/directives/**/*.ts',
			'source/models/**/*.ts',
			'source/services/**/*.ts',
			'source/*.ts',
		], ['typescript:www:application']);
	};
}