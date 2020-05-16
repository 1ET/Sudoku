const gulp = require("gulp");


gulp.task("webpack",() => {
    //引用模块
    const webpack = require("webpack-stream");
    const config = require("./webpack.config.js");
    //源文件
    gulp.src("./js/**/*.js")
        //输送给webpack
        .pipe(webpack(config))
        //结果保存位置
        .pipe(gulp.dest("../www/js"));
});


gulp.task("less",() => {
    const less = require("gulp-less");
    //源文件
    gulp.src("./less/**/*.less")
        //输送给webpack
        .pipe(less())
        //结果保存位置
        .pipe(gulp.dest("../www/css"));
});

gulp.task("default",["webpack","less"]);

//若文件有变动则自动编译
gulp.task("watch",()=>{
    gulp.watch("less/**/*.less",["less"]);
    gulp.watch("js/**/*.js",["webpack"]);
})