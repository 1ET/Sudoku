// 生成数独解决方案
const Toolkit = require("./toolkit")

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