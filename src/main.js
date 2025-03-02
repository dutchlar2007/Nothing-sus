// This code will be where I run the main stuff
// My goal with this is to be able to have a thing that runs similar to the Sans fight to ask Rachel to prom
var screen = document.getElementById("MainCanvas");
var oldtime = window.performance.now();
//===============================================================================================

context = screen.getContext("2d");
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;

function drawText(text, color, size, x, y) {
    context.font = size + "px sans serif";
    context.fillStyle = color;
    context.fillText(text, x, y);
}


//===============================================================================================
// This is class that I want to be able to have slowly display text. I want it to do it like undertales text
//The goal: I want to be able to make a reasonable text expression grammar to allow the computer to display the text in the right way
//I am thinking of using [] and some simple contents to make the text commands 
// commands: number will insert a pause, clear will clear the text being printed, 


class FancyText {
    constructor(text, size, x, y) {
        //text will store the entire text that the fancy text will processes
        this.text = text;
        this.xPos = x;
        this.yPos = y;
        this.size = size;
        //currentDrawnText is for the text that is curently on the screen.
        this.currentDrawnText = "";
        this.currentTextLocation = 0;
        this.textSpeed = 100;
        this.dTotal = 0;
        //sliceLocation will be used to add the next letter
        this.sliceLocation = 0
        this.breakActive = 0;
        this.keyJustPressed = 0;
        this.OGY = this.yPos;
        //This next function will cut up the input text into a set of strings
        this.stringRules = {
            break : this.break,
            clear : this.clear,
        };
        this.divText = [];
        this.divideText();
    }

    draw() {
        drawText(this.currentDrawnText, "#ffffff", this.size, this.xPos, this.yPos);
    }

    update(dt) {
        if (typeof this.divText[this.currentTextLocation] == "function"){
            this.divText[this.currentTextLocation](this, dt);
        } else {
            this.advanceText(dt);
        }
    }

    divideText() {
        var splitter = /\[|\]/;
        var strTbl = this.text.split(splitter);
        for (var i = 0; i < strTbl.length; i++) {
            if (this.stringRules[strTbl[i]]) {
                this.divText.push(this.stringRules[strTbl[i]]);
            } else {
                this.divText.push(strTbl[i]);
            }
        }
    }

    // This function will shift the text to the next entry in the splitted tex array.
    moveToNextText() {
        // addd one to the variable the sets what section the code is reading 
        this.currentTextLocation += 1;
        this.sliceLocation = 0
    }

    // This function will be the function calledd on text
    advanceText(dt) {
        this.dTotal = this.dTotal + dt;
        if (this.dTotal >= this.textSpeed) {
            if (this.divText[this.currentTextLocation].length > this.sliceLocation) {
                this.currentDrawnText = this.currentDrawnText + this.divText[this.currentTextLocation].slice(this.sliceLocation, this.sliceLocation + 1);
                this.sliceLocation += 1;
            } else {
                if (this.currentTextLocation < this.divText.length - 1) { // this logic prevents an error when readin the length of the object that isnt there
                    this.moveToNextText();
                }
            }
            this.dTotal = 0;
        }
    }
    //I want to make some functions that can be called by the code if they see something inside a string
    //I am not exactly sure how to make this happen. 
    break(fancyTextObject, dt) {
        //This function has the goal of being called as the update function
        if (fancyTextObject.keyJustPressed == 1) {
            fancyTextObject.keyJustPressed = 0;
            fancyTextObject.breakActive = 0;
            fancyTextObject.moveToNextText();
            return;
        }
        fancyTextObject.breakActive = 1;
    }

    clear(fancyTextObject, dt) {
        fancyTextObject.currentDrawnText = ""; // this function is getting called, so the way that the drawing is working is different than I thought
        fancyTextObject.moveToNextText();
        fancyTextObject.yPos = fancyTextObject.OGY;
    }

    keypressed(key) {
        if (this.breakActive == 1) {
            this.keyJustPressed = 1;
            this.breakActive = 0;
        }
    }
}


//===============================================================================================

class Box {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        context.beginPath();
        context.lineWidth = "3";
        context.strokeStyle = "#ffffff";
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
        context.closePath();
    }
}




//===============================================================================================

var drawable = [];
var updateable = [];

function keypressed(event) {
    var key = event.key;
    for (var i = 0; i < updateable.length; i++) {
        if (updateable[i].keypressed){
            updateable[i].keypressed(key);
        }
    }
}

function update() {
    var currentTime = window.performance.now();
    var dt = currentTime - oldtime;
    oldtime = currentTime;
    for (var j = 0; j < updateable.length; j++) { updateable[j].update(dt); }
}

function drawBackground() {
    context.beginPath();
    context.fillStyle = "#000000";
    context.fillRect(0,0, context.canvas.width, context.canvas.height);
    context.closePath();
}

function draw() {
    update();
    drawBackground();
    for (var j = 0; j < drawable.length; j++) { drawable[j].draw();}
}

//===============================================================================================

class ImageDrawer{
    constructor(src, x, y, scaledWidth, scaledHeight){
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
        this.width = scaledWidth;
        this.height = scaledHeight;
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

//===============================================================================================

function makeCenterTextBox(width, height, textSize,  text) {
    var screenWidth = context.canvas.width;
    var screenHeight = context.canvas.height;
    var xPos = screenWidth/2 - width/2;
    var yPos = 2*screenHeight/3;
    var textBox =  new Box(xPos, yPos, width, height);
    var textInBox = new FancyText(text, textSize, xPos + 10, yPos + textSize + 10);
    updateable.push(textInBox);
    drawable.push(textInBox);
    drawable.push(textBox); 
}

//===============================================================================================

//the image Im using is 323 X 308
var scaledHeight = context.canvas.height/3;
var scaledWidth = scaledHeight*323/308;
var img = new ImageDrawer("./assets/LilDude.jpg", context.canvas.width/2 - scaledWidth/2, context.canvas.height/2 - scaledHeight, scaledWidth, scaledHeight);


document.addEventListener("keydown", keypressed);
makeCenterTextBox(700, 100, 30, "it's a beautiful day outside.[break][clear]birds are singing, flowers are blooming . . . [break][clear]on days like these,[break] girls like you . . . [break][clear]should go to prom with me");
drawable.push(img);
setInterval(draw, 1);
