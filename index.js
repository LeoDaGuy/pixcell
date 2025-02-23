const express = require("express"); // use express
const app = express(); // create instance of express
const server = require("http").Server(app); // create server
const io = require("socket.io")(server); // create instance of socketio
var leftX = 45;
var rightX = -345;
var topY = 19; 
var bottomY = -371; 
var clusters = [];
app.use(express.static("public")); // use "public" directory for static files
//variables
var users = {}

//functions
function createUser(data) {
  try {
    if (data[1] === '') {
      users[data[0]] = {"name": "Unbranded Cell"};
    }
    else {
      users[data[0]] = {"name": data[1].substring(0,16)};
    }
    return;
  }

  catch (e) {
    return e;
  }
}
function selectClass(data) {
  // try {
    if (data[1] === 1) {
      users[data[0]].stats = {"health": {"current": 140, "max": 200}, "atp": {"current": 50, "max": 225}, "water": {"current": 150, "max": 225}, "waste": {"current": 0, "max": 300}, "glucose": {"current": 225, "max": 225}, "space": 7, "position": [-150,-172, 0]};
      users[data[0]].organelles = {"membrane": 2, "cytoplasm": 2, "nucleus": 0, "smoothER": 0, "roughER": 0, "golgi": 0, "vesicle": 0, "cellWall": 0, "chloroplast": 0, "ribosome": 1, "vacuole": 3, "mitochondria": 4, "lysosomes": 1, "microvilli": 0, "flagellum": 1};
      users[data[0]].slots = {1: ["", 0], 2: ["", 0], 3: ["", 0], 4: ["", 0]};
      users[data[0]].attacks = {};
      users[data[0]].cycle = {"second": {"health": 1, "atp": 20, "water": 120, "waste": 0, "glucose": -20, "space": 0}, "minute": {"ribosome": 0}};
    }
    else if (data[1] === 2) {
      users[data[0]].stats = {"health": {"current": 200, "max": 200}, "atp": {"current": 45, "max": 225}, "water": {"current": 50, "max": 225}, "waste": {"current": 0, "max": 300}, "glucose": {"current": 75, "max": 225}, "space": 5, "position": [-150,-172, 0]};
users[data[0]].organelles = {"membrane": 0, "cytoplasm": 0, "nucleus": 0, "smoothER": 0, "roughER": 0, "golgi": 0, "vesicle": 0, "cellWall": 1, "chloroplast": 1, "ribosome": 1, "vacuole": 3, "mitochondria": 1, "lysosomes": 2, "microvilli": 0, "flagellum": 1};
      users[data[0]].slots = {1: ["", 0], 2: ["", 0], 3: ["", 0], 4: ["", 0]};;
      users[data[0]].attacks = {};
      users[data[0]].cycle = {"second": {"health": 1, "atp": 0, "water": 5, "waste": 39, "glucose": 13, "space": 0}, "minute": {"ribosome": 0}};
    }
    else {
      throw new Error("Not a valid class!")
    }
    console.log(users)
    
    io.emit("newEnemy", data[0], users[data[0]].name, users[data[0]].organelles.microvilli, users[data[0]].organelles.cellWall);
    
    return users[data[0]];
  // }

  // catch (e) {
  //   return e;
  // }
}

//change the position of player and make sure they don't leave the boundaries
//these are the boundries for playing on a seperate window here: https://pixcell.leoxu2.repl.co/
//center = (x,y):(-150,-172)
function move(data) {
  //left border
  var leftX = 45;
  //right border
  var rightX = -345;
  //top border
  var topY = 19; 
  //bottom border
  var bottomY = -371; 

  //bottom y
  if (users[data[0]].stats.position[0] >= bottomY) {
    users[data[0]].stats.position[0] = users[data[0]].stats.position[0] + data[1];
  }

  else {
    users[data[0]].stats.position[0] = bottomY;
  }

  //right y
  if (users[data[0]].stats.position[1] >= rightX) {
    users[data[0]].stats.position[1] = users[data[0]].stats.position[1] + data[2];
  }

  else {
    users[data[0]].stats.position[1] = rightX;
  }

  //top y
  if (users[data[0]].stats.position[0] <= topY) {
    users[data[0]].stats.position[0] = users[data[0]].stats.position[0] + data[1];
  }

  else {
    users[data[0]].stats.position[0] = topY;
  }

  //left x
  if (users[data[0]].stats.position[1] <= leftX) {
    users[data[0]].stats.position[1] = users[data[0]].stats.position[1] + data[2];
  }

  else {
    users[data[0]].stats.position[1] = leftX;
  }

  users[data[0]].stats.position[2] = data[3];
  
  return users[data[0]];
}

//LUCAS FUNCTIONS! ! ! ! ! !
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// function spawnFood() {
//   x = Math.floor(Math.random()*6)
//   if (x > 3){
//     return [randomIntFromInterval(leftX, rightX), randomIntFromInterval(topY, bottomY)];
//   } else {
//     y = Math.floor(Math.random()*21)
//     if (y > 18 && clusters.length < 6) {
//       clusters.push([randomIntFromInterval(leftX, rightX), randomIntFromInterval(topY, bottomY)]);
//       return [randomIntFromInterval(leftX, rightX), randomIntFromInterval(topY, bottomY)];
//     }else if (y == 0 && clusters.length() != 0){
//       clusters.shift();
//       return [randomIntFromInterval(leftX, rightX), randomIntFromInterval(topY, bottomY)];
//     }else{
//      z = randomIntFromInterval(0, cluster.length() - 1)
//      return [(clusters[(2*z)] + floor(300 * math.random())), (clusters[(2*z)] + floor(300 * math.random())];
//     }
//   }
// }

//END OF LUCAS FUNCTIONS

//socket stuff
io.on("connection", socket => {
  socket.on("joinRequest", (data, callback) => {
    callback(createUser(data));
  });
  socket.on("classSelect", (data, callback) => {
    callback(selectClass(data));
  });
  socket.on("lose", (data) => {
    var deleteID = data;
    delete users[deleteID];
    socket.disconnect();
  });
  socket.on("move", (data, callback) => {
    try {
      callback(move(data));
    }
    catch (e) {
      //im too lazy to actually try so this is so taht it doesnt run randmonly when you jsut join
    }
  });//id, name, plant, microvilli
  socket.on("patchEnemy", (answer) => {
    var allPos = {};
    for (const [key, value] of Object.entries(users)) {
      try {
        answer([key, value.name, value.organelles.microvilli, value.organelles.cellWall]);
      }
      catch (e) {}
    }
  })
});

//Every 33 seconds give the positions of everyone
setInterval(function() {
  var allPos = {};
  for (const [key, value] of Object.entries(users)) {
    try {
      if (users[key].organelles.flagellum == 1) {
        allPos[key] = value.stats.position;
      }
    }
    catch (e) {}
  }
  io.emit("update", allPos);
}, 50);

server.listen(3000); // run server