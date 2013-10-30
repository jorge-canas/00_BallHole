window.onload = initLayout();

var winW, winH;
var boxH;
var ball;
var hole;
var mouseDownInsideball;
var touchDownInsideball;
var movementTimer;
var lastMouse, lastOrientation, lastTouch;
var rad;
var hRad;
var MAX = 1;
var holes = MAX;
var sideMargin;
var topMargin;
var bottomMargin;

// Initialisation on opening of the window

function init() {
    lastOrientation = {};
    window.addEventListener('resize', doLayout, false);
    initListener();
    window.addEventListener('deviceorientation', deviceOrientationTest, false);
    lastMouse = {x:0, y:0};
    lastTouch = {x:0, y:0};
    mouseDownInsideball = false;
    touchDownInsideball = false;
    doLayout(document);
}

function initListener(){
    var canvas = document.getElementById('surface');
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('touchmove', onTouchMove, false);
    canvas.addEventListener('touchstart', onTouchDown, false);
    canvas.addEventListener('touchend', onTouchUp, false);
}

function removeListener(){
    var canvas = document.getElementById('surface');
    canvas.removeEventListener('mousemove', onMouseMove, false);
    canvas.removeEventListener('mousedown', onMouseDown, false);
    canvas.removeEventListener('mouseup', onMouseUp, false);
    canvas.removeEventListener('touchmove', onTouchMove, false);
    canvas.removeEventListener('touchstart', onTouchDown, false);
    canvas.removeEventListener('touchend', onTouchUp, false);
}

// Does the gyroscope or accelerometer actually work?
function deviceOrientationTest(event) {
    window.removeEventListener('deviceorientation', deviceOrientationTest);
    if (event.beta != null && event.gamma != null) {
        window.addEventListener('deviceorientation', onDeviceOrientationChange, false);
        movementTimer = setInterval(onRenderUpdate, 10); 
    }
}

function initLayout(){
    
    if (window.innerWidth > window.innerHeight){
        winW = window.innerWidth*0.97;
        winH = window.innerHeight*0.83;
        boxH = window.innerWidth*0.10;
        
        var surface = document.getElementById('surface');
        surface.width = winW;
        surface.height = winH;
        var botonBox = document.getElementById('botonBox');
        botonBox.width = winW;
        botonBox.height = boxH;
        var time = document.getElementById('time');
        time.width = winW;
        time.height = boxH;
        
        rad = window.innerHeight*0.03;
        hRad = rad*1.4;
        sideMarginLeft = rad;
        sideMarginRigth = rad*3.7;
        topMargin =  document.getElementById("time").offsetHeight - rad;
        bottomMargin =  rad * 4.3 + document.getElementById("botonBox").offsetHeight;
        
    }else{
        winW = window.innerHeight*0.97;
        winH = window.innerHeight*0.66;
        boxH = window.innerHeight*0.19;
        
        var surface = document.getElementById('surface');
        surface.width = winW;
        surface.height = winH;
        var botonBox = document.getElementById('botonBox');
        botonBox.width = winW;
        botonBox.height = boxH;
        var time = document.getElementById('time');
        time.width = winW;
        time.height = boxH;
        
        rad = window.innerHeight*0.02;
        hRad = rad*1.4;
        sideMarginLeft = rad;
        sideMarginRigth = -rad*8;
        topMargin =  document.getElementById("time").offsetHeight - 20;
        bottomMargin =  rad * 16 + document.getElementById("botonBox").offsetHeight;
    }
}

function moveBall(xDelta, yDelta) {
    var moveX = ball.x + xDelta;
    var moveY = ball.y + yDelta;

    if (moveY < (window.innerHeight - bottomMargin) && moveY > topMargin){
        ball.y += yDelta;
    }

    if (moveX > sideMarginLeft && moveX < (window.innerWidth - sideMarginRigth)){
        ball.x += xDelta;
    }

    renderHole();
    renderBall();

    if (endGame()){
        init();
        holes--;
        actHoles();
        if (holes == 0){
            
            if (seconds < 10 && minutes < 10){
                alert("Congratulations! It's takes you 0"+minutes+":0"+seconds);
            }else if (minutes < 10){
                alert("Congratulations! It's takes you 0"+minutes+":"+seconds);
            }else if (seconds < 10){
                alert("Congratulations! It's takes you "+ minutes+":0"+seconds);
            }else {
                alert("Congratulations! It's takes you "+ minutes+":"+seconds);
            }
            
            botonStop();
        }
    }
}

function doLayout(event) {
    initLayout();

    ball = {    rad:rad,
                x:Math.round(window.innerWidth/2),
                y:Math.round(window.innerHeight/2),
                color:'rgba(255, 0, 0, 255)'};

    createHole();

    renderHole();
    renderBall();
}

function createHole(){
    var randX = Math.floor((Math.random()*winW)+hRad*2);
    
    if (randX > winW-hRad*2){
        randX = winW-hRad*3;
    }
    
    var randY = Math.floor((Math.random()*winH)+hRad*2);
    
    if (randY > winH-hRad*2){
        randY = winH-hRad*3;
    }

    hole = {	hRad:hRad,
                x:Math.round(randX),
                y:Math.round(randY),
                color:'rgba(0, 0, 0, 255)'};
}
	
function renderBall() {
    var surface = document.getElementById('surface');
    var context = surface.getContext('2d');

    context.beginPath();
    /*
    var image = new Image();
    image.src = "images/3dball.png";
    context.drawImage(image, ball.x, ball.y, ball.rad*2, ball.rad*2);
    */
    context.arc(ball.x, ball.y, ball.rad, 0, 2 * Math.PI, false);
    context.fillStyle = ball.color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = ball.color;
    context.stroke();
    
}

function renderHole() {
    var surface = document.getElementById('surface');
    var context = surface.getContext('2d');
    var image = 
    context.clearRect(0, 0, surface.width, surface.height);

    context.arc(hole.x, hole.y, hole.hRad, 0, 2 * Math.PI, false);
    context.fillStyle = hole.color;
    context.fill();
}

function onRenderUpdate(event) {
    var xDelta, yDelta;
    switch (window.orientation) {
        case 0: // portrait - normal
            xDelta = lastOrientation.gamma;
            yDelta = lastOrientation.beta;
            break;
        case 180: // portrait - upside down
            xDelta = lastOrientation.gamma * -1;
            yDelta = lastOrientation.beta * -1;
            break;
        case 90: // landscape - bottom right
            xDelta = lastOrientation.beta;
            yDelta = lastOrientation.gamma * -1;
            break;
        case -90: // landscape - bottom left
            xDelta = lastOrientation.beta * -1;
            yDelta = lastOrientation.gamma;
            break;
        default:
            xDelta = lastOrientation.gamma;
            yDelta = lastOrientation.beta;
    }
    moveBall(xDelta, yDelta);
}

function onMouseMove(event) {
    if(mouseDownInsideball){
        var xDelta, yDelta;
        xDelta = event.layerX - lastMouse.x;
        yDelta = event.layerY - lastMouse.y;
        moveBall(xDelta, yDelta);
        lastMouse.x = event.layerX;
        lastMouse.y = event.layerY;
    }
}

function onMouseDown(event) {
    var x = event.layerX;
    var y = event.layerY;
    if(	x > ball.x - ball.rad &&
        x < ball.x + ball.rad &&
        y > ball.y - ball.rad &&
        y < ball.y + ball.rad){
            mouseDownInsideball = true;
            lastMouse.x = x;
            lastMouse.y = y;
    } else {
        mouseDownInsideball = false;
    }
} 

function onMouseUp(event) {
    mouseDownInsideball = false;
}

function onTouchMove(event) {
    event.preventDefault();	
    if(touchDownInsideball){
        var touches = event.changedTouches;
        var xav = 0;
        var yav = 0;
        for (var i=0; i < touches.length; i++) {
            var x = touches[i].pageX;
            var y =	touches[i].pageY;
            xav += x;
            yav += y;
        }
        xav /= touches.length;
        yav /= touches.length;
        var xDelta, yDelta;

        xDelta = xav - lastTouch.x;
        yDelta = yav - lastTouch.y;
        moveBall(xDelta, yDelta);
        lastTouch.x = xav;
        lastTouch.y = yav;
    }
}

function onTouchDown(event) {
    event.preventDefault();
    touchDownInsideball = false;
    var touches = event.changedTouches;
    for (var i=0; i < touches.length && !touchDownInsideball; i++) {
        var x = touches[i].pageX;
        var y = touches[i].pageY;
        if( x > ball.x - ball.rad &&
            x < ball.x + ball.rad &&
            y > ball.y - ball.rad &&
            y < ball.y + ball.rad){
            touchDownInsideball = true;		
            lastTouch.x = x;
            lastTouch.y = y;			
        }
    }
} 

function onTouchUp(event) {
    touchDownInsideball = false;
}

function onDeviceOrientationChange(event) {
    lastOrientation.gamma = event.gamma;
    lastOrientation.beta = event.beta;
}

//chrono part
var seconds;
var minutes;
var timer;
var state = "stop";
var prevButton = "";
var start = document.getElementById("botonStart")

function changeActiveButton(now){
    now.style.backgroundColor="#00BFFF";
    if (prevButton !== ""){
        prevButton.style.backgroundColor="#ADFF2F";
    }
    prevButton = now;
}

function botonStart(){
    if(state === "stop"){
        init();
        clearInterval(timer);
        holes = MAX;
        actHoles();
        seconds = -1;
        minutes = 0;
        timer = setInterval(function(){myTimer();}, 1000);
        changeActiveButton(document.getElementById("botonStart"));
    }else if (state === "pause"){
        initListener();
        clearInterval(timer);
        timer = setInterval(function(){myTimer();}, 1000);
        changeActiveButton(document.getElementById("botonStart"));
    }
    
    state = "active";
}

function botonStop(){
    if(state == "active" || state == "pause"){
        state = "stop";
        clearInterval(timer);
        removeListener();
        seconds = -1;
        minutes = 0;
        changeActiveButton(document.getElementById("botonStop"));
    }    
}

function botonPause(){
    if(state == "active"){
        state = "pause";
        clearInterval(timer);
        removeListener();
        changeActiveButton(document.getElementById("botonPause"));
    }
}

function myTimer(){
    seconds++;
    if(seconds == 60){
        seconds = 0;
        minutes++;
    }
    if (seconds < 10 && minutes < 10){
        document.getElementById("time").innerHTML = "0"+minutes+":0"+seconds;
    }else if (minutes < 10){
        document.getElementById("time").innerHTML = "0"+minutes+":"+seconds;
    }else if (seconds < 10){
        document.getElementById("time").innerHTML = minutes+":0"+seconds;
    }else {
        document.getElementById("time").innerHTML = minutes+":"+seconds;
    }
}

function botonHoles(){
    if (state !="stop"){
        holes++;
        actHoles();
    }
}

function actHoles(){
    document.getElementById("botonHoles").innerHTML ="<strong>"+"Holes left: "+holes+"</strong>";
}

function endGame(){
    if(	ball.x - ball.rad > hole.x - hole.hRad &&
        ball.x + ball.rad < hole.x + hole.hRad &&
        ball.y - ball.rad > hole.y - hole.hRad &&
        ball.y + ball.rad < hole.y + hole.hRad){
            return true;
        }else return false;
}
