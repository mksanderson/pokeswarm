module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('bower.json', ['bower:source:install']);
	};
}