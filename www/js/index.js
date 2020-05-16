/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	const Grid = __webpack_require__(1)
	const PopupNumbers = __webpack_require__(6)
	
	
	const grid = new Grid($("#container"))
	grid.build()
	grid.layout()
	
	const popupnumbers = new PopupNumbers($("#popupNumbers"))
	grid.bindPopup(popupnumbers)
	
	$("#check").on("click", e => {
	    if(grid.check()){
	        alert("成功")
	    }    
	 })
	$("#reset").on("click", e => { 
	        grid.reset()
	})
	$("#clear").on("click", e => {
	    grid.clear()
	 })
	$("#rebuild").on("click", e => { 
	    grid.rebuild()
	})


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	// 生成九宫格
	const Toolkit = __webpack_require__(2)
	const Sudoku = __webpack_require__(3)
	const Checker = __webpack_require__(5)
	
	class Grid {
	    constructor(container){
	        this._$container = container;
	    }
	
	    build(){
	        // const generator = new Generator()
	        // generator.generate()
	        // const matrix = generator.matrix
	        const suduku = new Sudoku()
	        suduku.make()
	        const matrix = suduku.puzzleMatrix
	        const rowGroupClass = ["row_g_top", "row_g_middle", "row_g_bottom"]
	        const colGroupClass = ["col_g_left", "col_g_center", "col_g_right"]
	
	        const $cells = matrix.map(rowValues => rowValues.map((cellValue, colIndex) => {
	            return $("<span>")
	                .addClass(colGroupClass[colIndex % 3])
	                .addClass(cellValue?"fixed": "empty")
	                .text(cellValue)
	        }))
	
	        const $divArray = $cells.map(($spanArray, rowIndex) => {
	            return $("<div>")
	                .addClass("row")
	                .addClass(rowGroupClass[rowIndex % 3])
	                .append($spanArray)
	        })
	
	        this._$container.append($divArray)
	    } 
	
	    check(){
	        const $rows = this._$container.children()
	        const data = $rows
	            .map((rowIndex, div) => {
	            return $(div).children()
	                .map((colIndex, span) => parseInt($(span).text()) || 0)
	            })
	            .toArray()
	            .map($data => $data.toArray())
	
	        const checker = new Checker(data)
	        if(checker.check()){
	            return true
	        }
	
	        // 检查不成功进行标记
	        const marks = checker.matrixMarks
	        this._$container.children()
	            .each((rowIndex, div)=>{
	                $(div).children().each((colIndex, span)=>{
	                    const $span = $(span)
	                    if($span.is(".fixed") || marks[rowIndex][colIndex]){
	                        $span.removeClass("error")
	                    }else{
	                        $(span).addClass("error")
	                    }
	                })
	            })
	    }
	
	    reset(){
	        this._$container.find("span:not(.fixed)")
	            .removeClass("error mark1 mark2")
	            .addClass("empty")
	            .text(0)
	    }
	
	    clear(){
	        this._$container.find("span.error")
	            .removeClass("error")
	    }
	
	    rebuild(){
	        this._$container.empty()
	        this.build()
	        this.layout()
	    }
	
	    layout() {
	        const width = $("span:first", this._$container).width()
	        $("span", this._$container)
	            .height(width)
	            .css({
	                "line-height": `${width}px`,
	                "font-size": width < 32 ? `${width/2}px` : ""
	            })
	    }
	
	    bindPopup(popupNumbers){
	        this._$container.on("click", "span", e => {
	            const $cell = $(e.target)
	            if($cell.is(".fixed")){
	                return
	            }
	            popupNumbers.popup($cell )
	        })
	    }
	}
	
	module.exports = Grid

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// matrix and array tools
	const matrixToolkit = {
	    makeRow(v = 0) {
	        const array = new Array(9)
	        array.fill(v)
	        return array
	    },
	
	    makeMatrix(v = 0) {
	        return Array.from({ length: 9 }, () => this.makeRow(v))
	    },
	
	    // Fisher-Yates 洗牌算法
	    shuffle(array) {
	        const endIndex = array.length - 2
	        for (let i = 0; i <= endIndex; i++) {
	            const j = i + Math.floor(Math.random() * (array.length - i));
	            [array[i], array[j]] = [array[j], array[i]]
	        }
	        return array
	    },
	
	    checkFillable(matrix, n, rowIndex, colIndex) {
	        const row = matrix[rowIndex];
	        const column = this.makeRow().map((v, i) => matrix[i][colIndex]);
	        const { boxIndex } = boxToolkit.convertToBoxIndex(rowIndex, colIndex);
	        //宫
	        const box = boxToolkit.getBoxCells(matrix, boxIndex);
	        for (let i = 0; i < 9; i++) {
	            if (row[i] === n || column[i] === n || box[i] === n)
	                return false;
	        }
	        return true;
	    }
	}
	
	//Grid Axis
	const boxToolkit = {
	    getBoxCells(matrix, boxIndex) {
	        const startRowIndex = Math.floor(boxIndex / 3) * 3;
	        const startColIndex = boxIndex % 3 * 3;
	        const result = [];
	        for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
	            const rowIndex = startRowIndex + Math.floor(cellIndex / 3);
	            const colIndex = startColIndex + cellIndex % 3;
	            result.push(matrix[rowIndex][colIndex]);
	        }
	        return result;
	    },
	    convertToBoxIndex(rowIndex, colIndex) {
	        return {
	            boxIndex: Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3),
	            cellIndex: rowIndex % 3 * 3 + colIndex % 3
	        };
	    },
	    convertFromBoxIndex(boxIndex, cellIndex) {
	        return {
	            rowIndex: Math.floor(boxIndex / 3) * 3 + Math.floor(cellIndex / 3),
	            colIndex: boxIndex % 3 * 3 + cellIndex % 3
	        };
	    }
	}
	
	module.exports = class Toolkit {
	    static get matrix() {
	        return matrixToolkit
	    }
	    static get box() {
	        return boxToolkit
	    }
	}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	// 生成数独游戏
	
	// 1. 生成完成对解决方案: Generator
	// 2. 随机去除部分数据： 按比例
	
	const Generator = __webpack_require__(4)
	
	module.exports = class Sudoku {
	    constructor(){
	        const generator = new Generator()
	        generator.generate()
	        this.solutionMatrix = generator.matrix
	    }
	
	    make(level = 5){
	        // const shouldRid = Math.random() * 9 < level
	        // 生成迷盘
	        this.puzzleMatrix = this.solutionMatrix.map(row => {
	            return row.map(cell =>  Math.random() * 9 < level ? 0 : cell)
	        })
	
	    }
	}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	// 生成数独解决方案
	const Toolkit = __webpack_require__(2)
	
	module.exports = class Generator {
	
	    generate(){
	        while(!this.internalGenerate()){
	            console.warn("try again")
	        }
	    }
	
	    internalGenerate() {
	        this.matrix = Toolkit.matrix.makeMatrix()
	        this.orders = Toolkit.matrix.makeMatrix()
	            .map(row => row.map((v, i) => i))
	            .map(row => Toolkit.matrix.shuffle(row))
	
	        Toolkit.matrix.makeRow()
	        for (let n = 1; n <= 9; n++) {
	            if(!this.fillNumber(n)){
	                return false
	            }
	        }
	        return true
	    }
	    fillNumber(n) {
	        return this.fillRow(n, 0)
	    }
	    //递归
	    fillRow(n, rowIndex) {
	        if (rowIndex > 8) {
	            return true;
	        }
	        //行数据
	        const row = this.matrix[rowIndex];
	        //选择填写位置
	        const orders = this.orders[rowIndex];
	        for (let i = 0; i < 9; i++) {
	            //判断数据 如果此位置已有值，跳过
	            const colIndex = orders[i];
	            if (row[colIndex]) {
	                continue;
	            }
	            //检查此位置是否能填
	            if (!Toolkit.matrix.checkFillable(this.matrix, n, rowIndex, colIndex)) {
	                continue;
	            }
	            row[colIndex] = n;
	            //去下一行填写n 如果填写失败则继续寻找当前行下一个位置
	            if (!this.fillRow(n, rowIndex + 1)) {
	                row[colIndex] = 0;
	                continue;
	            }
	            return true;
	        }
	        return false;
	    }
	}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	// //检查数独解决方案
	function checkArray(array){
	    const length = array.length;
	    //定义标记
	    const marks = new Array(length);
	    marks.fill(true);
	    for (let i=0;i < length-1;i++){
	        if(!marks[i]){
	            continue;
	        }
	        const v = array[i];
	        //是否有效，0表示无效，1-9 有效
	        if(!v){
	            marks[i] = false;
	            continue;
	        }
	        //是否有重复 i+1=>9 是否有与位置i重复的数据
	        for( let j=i+1;j<length;j++){
	            if(v===array[j]){
	                marks[i] = marks[j] = false;
	            }
	        }
	    }
	    return marks;
	}
	// // console.log(checkArray([1,2,3,4,5,6,7,8,9]));
	// // console.log(checkArray([1,2,3,4,0,6,7,8,9]));
	// // console.log(checkArray([1,2,3,4,6,7,7,9,2]));
	const Toolkit = __webpack_require__(2);
	//输入：matrix 用户完成的数独数据，9*9
	//处理：对matrix 行、列、宫进行检查，并填写marks
	//输出：检查是否成功、marks
	class Checker{
	    constructor(matrix){
	        this._matrix = matrix;
	        this._matrixMarks = Toolkit.matrix.makeMatrix(true);
	    }
	
	    get matrixMarks(){
	        return this._matrixMarks;
	    }
	
	    get isSuccess(){
	        return this._success;
	    }
	
	    check(){
	        this.checkRows();
	        this.checkCols();
	        this.checkBoxes();
	        //检查是否成功
	        //Array.prototype.every()
	        this._success = this._matrixMarks.every(row => row.every(mark => mark))
	        return this._success;
	    }
	    checkRows(){
	        for(let rowIndex=0;rowIndex < 9;rowIndex++){
	            const row = this._matrix[rowIndex];
	            const marks = checkArray(row);
	            for(let colIndex=0;colIndex < marks.length;colIndex++){
	                if(!marks[colIndex]){
	                    this._matrixMarks[rowIndex][colIndex] =false;
	                }
	            }
	        }
	    }
	    checkCols(){
	        for(let colIndex=0;colIndex < 9;colIndex++){
	            const cols = [];
	            for(let rowIndex=0;rowIndex < 9;rowIndex++){
	                cols[rowIndex]= this._matrix[rowIndex][colIndex];
	            }
	            const marks = checkArray(cols);
	            for(let rowIndex=0;rowIndex < marks.length;rowIndex++){
	                if(!marks[rowIndex]){
	                    this._matrixMarks[rowIndex][colIndex] = false;
	                }
	            }
	        }
	    }
	    checkBoxes(){
	        for(let boxIndex=0;boxIndex < 9;boxIndex++){
	            const boxes = Toolkit.box.getBoxCells(this._matrix,boxIndex);
	            const marks = checkArray(boxes);
	            for(let cellIndex=0;cellIndex < 9;cellIndex++){
	                if(!marks[cellIndex]){
	                    const {rowIndex,colIndex}= Toolkit.box.convertFromBoxIndex(boxIndex,cellIndex);
	                    this.matrixMarks[rowIndex][colIndex] =false;
	                }
	            }
	        }
	    }
	}
	
	module.exports = Checker

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	// 处理弹出的操作面板
	module.exports = class PopupNumbers {
	    constructor($panel) {
	        this._$panel = $panel.hide().removeClass("hidden")
	        this._$panel.on("click", "span", e => {
	            const $cell = this._$targetCell;
	
	            const $span = $(e.target)
	            // 1-9 回填数字
	            if ($span.hasClass("mark1")) {
	                if ($cell.hasClass("mark1")) {
	                    $cell.removeClass("mark1")
	                } else {
	                    $cell.removeClass("mark2")
	                        .addClass("mark1")
	                }
	
	            } else if ($span.hasClass("mark2")) {
	                if ($cell.hasClass("mark2")) {
	                    $cell.removeClass("mark2")
	                } else {
	                    $cell.removeClass("mark1")
	                        .addClass("mark2")
	                }
	            } else if ($span.hasClass("empty")) {
	                $cell.text(0)
	                    .addClass("empty")
	
	            } else {
	                $cell.removeClass("empty")
	                    .text($span.text())
	            }
	            this.hide()
	        })
	    }
	    popup($cell) {
	        this._$targetCell = $cell
	        const { left, top } = $cell.position()
	        this._$panel.css({
	            left: `${left}px`,
	            top: `${top}px`
	        })
	            .show()
	    }
	    hide() {
	        this._$panel.hide()
	    }
	}

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map