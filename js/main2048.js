var board = new Array();
var score = 0;
var hasConflicted = new Array();//每次移动最多碰撞一次，用于记录是否发生碰撞

//触摸发生和结束的位置
var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;

$(document).ready(function(){
    prepareForMobile();
    newGame();
});

function prepareForMobile(){
    if(documentWidth > 500){//此时不需适配移动版，赋给固定值，相当于变为网页版
        gridContainerWidth = 330;
        cellSpace = 10;
        cellSideLength = 70;
    }

    $('#grid-container').css('width',gridContainerWidth - 2 * cellSpace);
    $('#grid-container').css('height',gridContainerWidth - 2 * cellSpace);
    $('#grid-container').css('padding',cellSpace);
    $('#grid-container').css('border-radius',0.02 * gridContainerWidth);

    $('.grid-cell').css('width',cellSideLength);
    $('.grid-cell').css('height',cellSideLength);
    $('.grid-cell').css('border-radius',0.02 * cellSideLength);
}

function newGame(){
    //初始化棋盘格
    init();
    //在随机两个格子生成数字
    generateOneNumber();
    generateOneNumber();
}

function init(){
    for(var i = 0;i < 4;i++)
    for(var j = 0;j < 4;j++){
        var gridCell = $("#grid-cell"+"-"+i+"-"+j);
        gridCell.css('top',getPosTop(i,j));
        gridCell.css('left',getPosLeft(i,j));
    }

    //将board变为二维数组，存储将要显示的数字
    for(var i = 0;i < 4;i++){
        board[i] = new Array();
        hasConflicted[i] = new Array();//也将其变为二维数组
        for(var j = 0;j < 4;j++){
            board[i][j] = 0;//开始每个格子都初始化为0
            hasConflicted[i][j] = false;//都初始化为false
        }
    }
    score = 0;//分数初始化

    updateBoardView();
}

//函数作用：根据board变量的值对要显示的元素进行操作
function updateBoardView(){
    $(".number-cell").remove();
    for(var i = 0;i < 4;i++) {
        for (var j = 0; j < 4; j++) {
            $("#grid-container").append('<div class="number-cell" id="number-cell-' + i + '-' + j + '"></div>');
            var theNumberCell = $('#number-cell-' + i + '-' + j);
            //确定数字的位置
            if (board[i][j] == 0) {//数字为0的话不显示
                theNumberCell.css('width', '0px');
                theNumberCell.css('height', '0px');
                theNumberCell.css('top', getPosTop(i, j) + cellSideLength / 2);//位置放在了小方格的中间
                theNumberCell.css('left', getPosLeft(i, j) + cellSideLength / 2);
            } else {
                theNumberCell.css('width', cellSideLength);
                theNumberCell.css('height', cellSideLength);
                theNumberCell.css('top', getPosTop(i, j));
                theNumberCell.css('left', getPosLeft(i, j));
                //改变数字的颜色和背景色
                theNumberCell.css('background-color', getNumberBackgroundColor(board[i][j]));
                theNumberCell.css('color', getNumberColor(board[i][j]));
                //显示数字的值
                theNumberCell.text(board[i][j]);

            }
            hasConflicted[i][j] = false;//每次更新棋盘也要将其初始化为false
        }
    }
    updateScore(score);

    $('.number-cell').css('line-height',cellSideLength + 'px');
    $('.number-cell').css('font-size',0.6 * cellSideLength + 'px');

}

function generateOneNumber(){
    //是true时，当前棋盘格无空间了，返回false
    if(nospace(board))
        return false;
    //随机一个位置
    var randx = parseInt(Math.floor(Math.random()*4));
    var randy = parseInt(Math.floor(Math.random()*4));

   /*while(true){//如果生成的位置上无数字，则可以，如果随机生成的位置上已有数字，则要重新生成
       if(board[randx][randy] == 0)
       break;

        randx = parseInt(Math.floor(Math.random()*4));
        randy = parseInt(Math.floor(Math.random()*4));
   }*/

    //如果用死循环的话，后期产生随机位置可能会效率很难,因为假设只剩一个空格时，循环可能要花很长时间才能正好正成在那个位置
    //先最多让其循环50次，若循环完还没找到无数字的随机位置的话，则手动找到一个随机位置
    for(var i = 0;i < 50;i++){
        if(board[randx][randy] == 0) {
            break;
        }else{
            randx = parseInt(Math.floor(Math.random()*4));
            randy = parseInt(Math.floor(Math.random()*4));
        }
    }
    if(i == 50){//未找到无数字的随机位置，手动查找一个位置
        for(var i = 0;i < 4;i++){
            for(var j = 0;j < 4;j++){
                if(board[i][j] == 0){
                    randx = i;
                    randy = j;
                }
            }
        }
    }
    //随机一个数字，50%概率生成数字2,50%生成数字4
    var randNumber = Math.random() < 0.5 ? 2 : 4;
    //在随机的位置上显示数字
    board[randx][randy] = randNumber;
    showNumberWithAnimation(randx,randy,randNumber);

    return true;
}


//基于玩家响应的游戏循环
$(document).keyup(function(event){

    switch (event.keyCode){
        case 37://left
            event.preventDefault();//阻挡按键时的默认效果（不让滚动条滚动）
            if(moveLeft()){//moveLeft()函数有个返回值，能移动时返回true,当所有数字都在左侧时返回false,不进行操作
                setTimeout("generateOneNumber()",210);//新增一个数字
                setTimeout("isgameover()",300);//判断游戏是否结束
            }
            break;
        case 38://up
            event.preventDefault();
            if(moveUp()){
                setTimeout("generateOneNumber()",210);//同理，要让动画延迟一会发生
                setTimeout("isgameover()",300);
            }
            break;
        case 39://right
            event.preventDefault();
            if(moveRight()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
            break;
        case 40://down
            event.preventDefault();
            if(moveDown()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);;
            }
            break;
        default :break;
    }
});

//添加触摸的事件监听
document.addEventListener('touchstart',function(event){
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;
});
document.addEventListener('touchmove',function(event){
    event.preventDefault();
});
document.addEventListener('touchend',function(event){
    endX = event.changedTouches[0].pageX;
    endY = event.changedTouches[0].pageY;

    //触摸结束后，判断是向哪个方向滑动的
    var deltax = endX - startX;
    var deltay = endY - startY;

    //设置一个域值，避免只是点击时而产生的滑动
    if(Math.abs(deltax) < 0.3 * documentWidth && Math.abs(deltay) < 0.3 * documentWidth){
        return;
    }

    //在x方向滑动的
    if(Math.abs(deltax) >= Math.abs(deltay)){
        if(deltax > 0){
            //向右滑的，x正方向
            if(moveRight()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }else{
            //向左滑的
            if(moveLeft()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
    }
    //在y方向滑动的
    else{
        if(deltay > 0){
            //向下滑的，y轴正方向，在手机屏幕中，y正向是向下的
            if(moveDown()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);;
            }
        }else{
            //向上滑动的
            if(moveUp()){
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
    }
});
function moveLeft(){
    if(!canMoveLeft(board)) {//如果当前不能移动，返回false
        return false;
    }
    //moveLeft
    for(var i = 0; i < 4;i++) {
        for (var j = 1; j < 4; j++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < j; k++) {//对当前列进行循环
                    if (board[i][k] == 0 && noBlockHorizontal(i, k, j, board)) {//前面无数字并且之前无障碍
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[i][k] == board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {//与前面的数字相等且无障碍并且没发生过碰撞
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        updateScore(score);//更新分数

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }
    //重新对整体数据进行一次刷新
    setTimeout("updateBoardView()",200);//for循环进行的非常快，动画还没来得及执行就已经刷新了，所以要用下延时函数
    return true;
}

function moveRight(){
    if(!canMoveRight(board)) {//如果当前不能移动，返回false
        return false;
    }

    //moveRight
    for(var i = 0; i < 4;i++) {
        for (var j = 2; j > -1; j--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, j, k, board)) {//前面无数字并且之前无障碍
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[i][k] == board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {//与前面的数字相等且无障碍
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        updateScore(score);//更新分数

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }
    //重新对整体数据进行一次刷新
    setTimeout("updateBoardView()",200);//for循环进行的非常快，动画还没来得及执行就已经刷新了，所以要用下延时函数
    return true;
}

function moveUp(){
    if(!canMoveUp(board)) {//如果当前不能移动，返回false
        return false;
    }

    //moveUp
    for(var j = 0; j < 4;j++) {//先循环列，再循环行
        for (var i = 1; i < 4; i++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] == 0 && noBlockVertical(j, k, i, board)) {//前面无数字并且之前无障碍
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[k][j] == board[i][j] && noBlockVertical(j, k, i, board) && !hasConflicted[k][j]) {//与前面的数字相等且无障碍
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        updateScore(score);//更新分数

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }
    //重新对整体数据进行一次刷新
    setTimeout("updateBoardView()",200);//for循环进行的非常快，动画还没来得及执行就已经刷新了，所以要用下延时函数
    return true;
}

function moveDown(){
    if(!canMoveDown(board)) {//如果当前不能移动，返回false
        return false;
    }

    //moveDown
    for(var j = 0; j < 4;j++) {//先循环列，再循环行
        for (var i = 2; i > -1; i--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] == 0 && noBlockVertical(j, i, k, board)) {//前面无数字并且之前无障碍
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;

                        continue;
                    } else if (board[k][j] == board[i][j] && noBlockVertical(j, i, k, board) && !hasConflicted[k][j]) {//与前面的数字相等且无障碍
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        updateScore(score);//更新分数

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }
    //重新对整体数据进行一次刷新
    setTimeout("updateBoardView()",200);//for循环进行的非常快，动画还没来得及执行就已经刷新了，所以要用下延时函数
    return true;
}

function isgameover(){
    if(nospace(board) && nomove(board)){
        gameover();
    }
}

function gameover(){
    alert('Game Over!' + '\n' + "You score is" + " "+ score);
}

