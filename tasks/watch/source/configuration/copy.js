module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch(
			[
				'source/*.{js, txt, xml}',
				'source/browser/*'
			], ['copy:www:configuration']
		);
	};
}