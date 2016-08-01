module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch(['bower.json','www/bower_components/**/*'], ['bower:www:install']);
	};
}