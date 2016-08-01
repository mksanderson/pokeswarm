module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch(
			[
				'source/bower_components/**',
			], ['copy:www:dependencies']
		);
	};
}