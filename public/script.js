//Import socket
const socket = io();

//idk
console.log("bonjour friend")

/*Variables*/
var userID = uid()
var classhoverable = false;
var user;
var speed = 1;
var mouseX;
var mouseY;
var speedMult = 0.004;
var clicked = false;
var bodyType;
var blur = 15;

//DOM
var sheepAd = document.getElementById("sheep");
var sheepText = document.getElementById("sheep-text");
var sheepLoad = document.getElementById("sheep-loading");
var start = document.getElementById('start');
var namefield = document.getElementById('namefield');
var leftpan = document.getElementById('leftpan');
var rightpan = document.getElementById('rightpan');
var rightpancont = document.getElementById('rightcont')
var gameSection = document.getElementById("game");
var gameBG = document.getElementById("game-bg");
var minimap = document.getElementById("dot");
var orgs = document.getElementById("char-orgs");
var losePage = document.getElementById("lose");
var loseReason = document.getElementById("lose-reason");
var character = document.getElementById("character")
var x = 0.4950874835789475
/*Functions*/

//Make id's
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

//Fade in and out elements
function fadeIn(element) {
    var op = 0.01;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}
function fadeOut(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.04){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= 0.01;
    }, 15);
}


//LUCAS FUNCTIONS
function ABSlesser(num1, num2){
  if (Math.abs(num1) > Math.abs(num2)) {
    return num2;
  } else {
    return num1;
  }
}
function returnone(){
  return 1
}
function isNeg(num){
  if (num * -1 > num){
    return -1
  } else{
    return 1
  }
}

function quadrant(x,y){
  if (Math.abs(x) > x){
    if (Math.abs(y) > y){
      return 1;
    } 
    else {
      return 2;
    }
  }else{
    if (Math.abs(y) > y) {
      return 3;
    } 
    else {
      return 4
    }
  }
}
//END OF LUCAS FUNCTIONS

//Moving
function moveCharacter() {
  if (true) {
    // var hypotenuse = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2)); 
    var angle = Math.atan(mouseY / mouseX)
    if (quadrant(mouseX,mouseY) == 1){
      var moveX = ABSlesser(-1*mouseX * speedMult , speed * Math.cos(angle));
      var moveY = ABSlesser(-1*mouseY * speedMult, speed * Math. sin(angle));
    }
    if (quadrant(mouseX,mouseY) == 2){
      var moveX = ABSlesser(-1*mouseX * speedMult , speed * Math.cos(angle));
      var moveY = ABSlesser(-1*mouseY * speedMult, speed * Math. sin(angle));
    }
    if (quadrant(mouseX,mouseY) == 3){
      var moveX = ABSlesser(-1*mouseX * speedMult , speed *-1* Math.cos(angle));
      var moveY = ABSlesser(-1*mouseY * speedMult, speed *-1* Math. sin(angle));
    }
    if (quadrant(mouseX,mouseY) == 4){
      var moveX = ABSlesser(-1*mouseX * speedMult , speed *-1* Math.cos(angle));
      var moveY = ABSlesser(-1*mouseY * speedMult, speed *-1* Math. sin(angle));
    }

    var moveAngle = getAngle(mouseX, mouseY);
    if (moveAngle == null) {
      moveAngle = 0;
    }
    socket.emit("move", [userID, moveX, moveY, moveAngle], (answer) => {
      user = answer;
      resetPos();
    });
  }
}

//Shuffle an array
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

//Get random colour from string
function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

//Find quadrant of (x,y) and then get the angle using tan^-1
function getAngle(x, y) {
  var angleAdd = 90;
  if (x >= 0) {
    angleAdd = -90;
  }

  return angleAdd - (Math.atan(y/x) * 180 / Math.PI)
}


//Start game
function startGame() {
  window.addEventListener("mousedown", function(event){
    clicked = true;
    window.onmousemove = function(event) {
      mouseY = event.pageX - window.innerWidth / 2;
      mouseX = event.pageY - window.innerHeight / 2;
      character.style.transform = "rotate(" + getAngle(mouseX, mouseY) + "deg)";
     }
  });
  window.addEventListener("mouseup", function(){
      clicked = false;
  });
  setInterval(moveCharacter, 50);
  gameSection.style.display = "block";
  resetPos();
  resetChar();
}

//Lose
function lose(reason) {
  loseReason.innerText = reason;
  fadeIn(losePage);
  socket.emit("lose", userID);
}

//Reset position
function resetPos() {
  gameBG.style.top = user.stats.position[0].toString() + "vw";
  gameBG.style.left = user.stats.position[1].toString() + "vw";
  minimap.style.top = (- user.stats.position[0] / 40 + 0.6).toString() + "vw";
  minimap.style.left = (- user.stats.position[1] / 40 + 1.1).toString() + "vw";
}

//Reset organelles
function resetChar() {
  character.style.backgroundImage = "url('assets/img/cells/" + bodyType + ".gif')";
  character.style.filter = "drop-shadow(0px 0px 10px" + stringToColour(user.name) + ")";

  
  var char = [];
  var charSpace = user.stats.space + 1;
  var k = 0;
  var organellez = [];
  var outside;
  var flagellum = false;
  
  for (const [key, value] of Object.entries(user.organelles)) {
    if (key == "membrane" && user.organelles.cellWall == 0 && user.organelles.microvilli == 0) {
      organellez.push("membrane");
    }
    else if (key == "membrane" && user.organelles.cellWall == 1 && user.organelles.microvilli == 0) {
      organellez.push("wall");
    }
    else if (key == "membrane" && user.organelles.cellWall == 0 && user.organelles.microvilli == 1) {
      organellez.push("microvilli");
    }
    else if (key == "cytoplasm") {
      if (Math.abs(value - user.organelles.membrane) > 2) {
        lose("The difference between your cell membrane and your cytoplasm was too great!");
      }
    }
    else if (key == "nucleus") {
      organellez.push("nucleus");
    }
    else if (key == "smoothER") {
      organellez.push("smooth-er");
    }
    else if (key == "roughER") {
      organellez.push("rough-er");
    }
    else if (key == "golgi") {
      organellez.push("golgi");
    }
    else if (key == "vesicle") {
      var m = 0;
      while (m < value) {
        organellez.push("vesicle");
      }
    }
    else if (key == "chloroplast") {
      var m = 0;
      while (m < value) {
        organellez.push("chloroplast");
        m = m + 1;
      }
    }
    else if (key == "ribosome") {
      var m = 0;
      while (m < value) {
        organellez.push("ribosome");
        m = m + 1;
      }
    }
    else if (key == "vacuole") {
      var m = 0;
      while (m < value) {
        organellez.push("vacuole");
        m = m + 1;
      }
    }
    else if (key == "mitochondria") {
      var m = 0;
      while (m < value) {
        organellez.push("mitochondria");
        m = m + 1;
      }
    }
    else if (key == "lysosomes") {
      var m = 0;
      while (m < value) {
        organellez.push("lysosome");
        m = m + 1;
      }
    }
  }

  orgs.innerHTML = "";

  //ik this is a function shut
  const groupSimilar = arr => {
   return arr.reduce((acc, val) => {
      const { data, map } = acc;
      const ind = map.get(val);
      if(map.has(val)){
         data[ind][1]++;
      } else {
         map.set(val, data.push([val, 1])-1);
      }
      return { data, map };
   }, {
      data: [],
      map: new Map()
   }).data;
  };
  
  var orgaz = groupSimilar(organellez)
  var organz = [];
  for (const orgos of orgaz) {
    organz.push([orgos[0], orgos[0] + " x" + orgos[1]]);
  }
  
  for (const org of organz) {
    var newListThing = document.createElement("li");
    var newImg = document.createElement("img");
    newImg.src = "/assets/img/organelle/" + org[0] + ".png";
    newListThing.append(newImg);
    newListThing.append(org[1]);
    orgs.append(newListThing);
  }
}

/*Code*/

//Fade in the sheep ad text
fadeIn(sheepText);
//Fade out the ad if the page is done loading
setTimeout(() => {
  if (document.readyState === "complete") {
    fadeOut(sheepAd);
  }
  else {
    window.onload = function() {
      fadeIn(sheepLoad);
      fadeOut(sheepAd);
    };
  }
}, 2000);

//Create enemies
function createEnemy(id, name, microvilli, plant) {
  if (id != userID) {
    var newEnemy = document.createElement('div');
    var enemyImg = document.createElement('img');
    var enemyName = document.createElement('p');
    newEnemy.classList.add("enemy");
    enemyImg.classList.add("enemy-img");
    enemyName.classList.add("enemy-name");
    
    if (plant == 1) {
      enemyImg.src = "assets/img/cells/plant.gif";
    }
  
    else if (microvilli == 1) {
      enemyImg.src = "assets/img/cells/microvilli.gif";
    }
  
    else {
      enemyImg.src = "assets/img/cells/animal.gif";
    }
  
    enemyImg.style.filter = "drop-shadow(0px 0px 10px" + stringToColour(name) + ")";
    enemyName.innerText = name;
    
    newEnemy.append(enemyImg);
    newEnemy.append(enemyName);
    
    newEnemy.id = id;
    gameBG.append(newEnemy);
  }
}

//Join Game
function joinGame() {
  var name = namefield.value;
  socket.emit("joinRequest", [userID, name], (answer) => {
    leftpan.style.left = "-16vw";
    rightpan.style.right = "-10vw";
    setTimeout(function(){
      classhoverable = true;
    }, 700);
  });
}

function classhover(num) {
  if (classhoverable === true) {
    if (num === 1) {
      leftpan.style.width = "85%";
      rightpan.style.right = "-22vw";
      rightpancont.style.transitionDuration = "0.5s";
      rightpancont.style.paddingRight = "15vw";
    }
    else if (num === 2) {
      leftpan.style.width = "55%";
      rightpan.style.width = "65%";
      rightpan.style.right = "-4vw";
      rightpancont.style.transitionDuration = "0.5s";
      rightpancont.style.paddingRight = "4vw";
    }
    else if (num === 3) {
      leftpan.style.width = "67%";
      rightpan.style.right = "-10vw";
      rightpancont.style.transitionDuration = "0";
      rightpancont.style.paddingRight = "8vw";
    }
    else if (num === 4) {
      leftpan.style.width = "67%";
      rightpan.style.width = "60%"
      rightpan.style.right = "-10vw";
      rightpancont.style.transitionDuration = "0";
      rightpancont.style.paddingRight = "8vw";
    }
  }
}

function classSelect(classNum) {
  if (classNum == 1) {
    bodyType = "animal";
  }
  else if (classNum == 2) {
    bodyType = "plant";
  }
  socket.emit("classSelect", [userID, classNum], (answer) => {
    user = answer;
    startGame();
    resetChar();
    start.style.display = "none";
    classhoverable = false;
    rightpan.style.right = "-120%";
    leftpan.style.left = "-120%";
    setTimeout(function(){
      rightpan.style.display = "none";
      leftpan.style.display = "none";
    }, 700);
  });
}

socket.on("newEnemy", (id, name, microvilli, plant) => {
  createEnemy(id, name, microvilli, plant);
});



          
socket.on("update", (users) => {
  //update map with all the new people
  for (const [key, value] of Object.entries(users)) {
    if (speed > 1){
      speed = 1;
    }
    if (key == userID) {
    }
    else if (document.getElementById(key) == null) {
      console.log("oop!");
      socket.emit("patchEnemy", (answer) => {
        createEnemy(key, answer[0], answer[1], answer[2]);
      });
    }
    else {
      console.log([key, value]);
      var realPos = [-value[0] / 4 + 5, -value[1] / 4 + 11];
      document.getElementById(key).style.top = realPos[0] + "%";
      document.getElementById(key).style.left = realPos[1] + "%";
      var enimage= document.getElementById(key).querySelector(".enemy-img");
      enimage.style.transform = "rotate(" + value[2] + "deg)";
    }
  }
});