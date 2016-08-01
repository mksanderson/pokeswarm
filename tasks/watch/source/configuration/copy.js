module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch(
			[
				'source/*.{txt, xml}',
				'source/browser/*'
			], ['copy:www:configuration']
		);
	};
}