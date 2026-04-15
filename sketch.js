// Zombie, Player, and Obstacle assets taken from or referenced from, https://ittaimanero.itch.io/zombie-apocalypse-tileset
// Music and sound taken: 
//Death sound - https://pixabay.com/sound-effects/film-special-effects-pixel-death-66829/
// Damage sound - https://pixabay.com/sound-effects/film-special-effects-retro-hurt-2-236675/
// Music - https://pixabay.com/sound-effects/musical-pixel-song-11-79563/
let state = 0; // 0 = start menu, 1 = playing, 2 = dead

//background
let bgY = 0;
let bgSpeed = 4; // adjust for speed

//player
let playerX = 225; //x coordinate
let playerLives = 3;

//timer
let startTime;
let survivalTime = 0;

//obstacle
let obstacles = [];
let points = [{ x: 75 }, { x: 225 }, { x: 375 }]; //points of the lanes
let obstacleTimer = 120;

//life
let lifes = [];
let lifeTimer = 180;

//difficulty
let difficultyLevel = 0;
let obstacleSpeed = 4;
let spawnRate = 40;

function preload() {
  //loads files
  BG = loadImage("Road.gif");
  Player = loadImage("Player.gif");
  Zombie = loadImage("Zombie.gif");
  Health = loadImage("Medkit.png");
  Log = loadImage("Log.png");
  Tires = loadImage("Tires.png");

  //load sounds
  Music = loadSound("Music.mp3");
  Damage = loadSound("Damage.mp3");
  Dead = loadSound("Dead.mp3");
}

function setup() {
  createCanvas(450, 730);
  startTime = millis(); //start counting when game begins
  //millis = milliseconds since the sketch began running
  
  stroke(255);
} 

function draw() {
  background(30);

  //different screen states (Start = 0, Play = 1, Death = 2)
  //start screen
  if (state == 0) {
    startScreen();
    return;
  } else if (state == 1) { //play screen
    if (playerLives > 0) {
      survivalTime = floor((millis() - startTime) / 1000); //floor = removing decimals
    }

    //background
    if (state == 1) {
      bgY += bgSpeed;

      if (bgY >= height) {
        bgY = 0;
      }

      imageMode(CENTER); //Scrolling screen for the moving road
      image(BG, 225, bgY - height / 2, 630, 730);
      image(BG, 225, bgY + height / 2, 630, 730);
    } else {
      background(40); // plain background for menus
    }

    //death screen
    if (playerLives <= 0) {
      Music.stop(); //stop music on death
      Dead.play(); //play death sound
      state = 2;
      return;
    }

    fill(255);

    //collision checks
    //life/health
    for (let j = 0; j < lifes.length; j++) {
      //use j instead of i bc it would break the logic
      lifes[j].show();
      lifes[j].move();

      let d = dist(playerX, 570, lifes[j].x, lifes[j].y);

      if (d < 50) {
        playerLives++; //add life
        lifes.splice(j, 1); //cut object
      }
    }

    //obstacles
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].show();
      obstacles[i].move();
      let d = dist(playerX, 570, obstacles[i].x, obstacles[i].y); //the gap between player and obstacle

      if (d < 50) {
        playerLives--; //delete life

        //damage sound
        if (!Damage.isPlaying()) {
          Damage.play();
        }
        obstacles.splice(i, 1);
      }
    }

    lifeSpawn();
    obstacleSpawn();
    updateDifficulty();

    //Player
    imageMode(CENTER);
    image(Player, playerX, 570, 80, 80);

    //Zombies
    image(Zombie, 75, 675, 90, 100);
    image(Zombie, 225, 675, 90, 100);
    image(Zombie, 375, 675, 90, 100);

    //player health
    textAlign(LEFT);
    fill(50);
    rectMode(RADIUS);
    rect(10, 10, 160, 100);
    textSize(30);
    fill(255);
    text("Health: " + playerLives, 20, 40);
    text("Time: " + survivalTime, 20, 80);
  } else if (state == 2) {// death screen
    failScreen();
  }
}

function keyPressed() {
  //start game
  if (state == 0 && key === " ") {
    state = 1;
    startTime = millis();

    //music plays during this screen
    if (!Music.isPlaying()) {
      //! = if music is NOT playing
      Music.loop(); //loops music
    }
    return;
  }

  //restart after death
  if (state == 2 && (key === "f" || key === "F")) {
    restartGame();
    state = 1;

    if (!Music.isPlaying()) {
      Music.loop(); //restart music
    }
    return;
  }

  if (state !== 1) return;

  if (keyIsDown(LEFT_ARROW)) {
    playerX = playerX - 150;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    playerX = playerX + 150;
  }
  playerX = constrain(playerX, 75, 375);

  if (keyCode === 65) {
    playerX = playerX - 150;
  }
  if (keyCode === 68) {
    playerX = playerX + 150;
  }
  playerX = constrain(playerX, 75, 375);
}

class Obstacle {
  constructor(tempX, tempY, tempR, tempSpeed, img) {
    this.x = tempX;
    this.y = tempY;
    this.r = tempR;
    this.speed = tempSpeed;
    this.img = img; // store which image to use
  }

  show() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, 125, 60);
  }

  move() {
    this.y = this.y + this.speed;
  }
}

class Life {
  constructor(tempX, tempY, tempR, tempSpeed) {
    this.x = tempX;
    this.y = tempY;
    this.r = tempR;
    this.speed = tempSpeed;
  }

  show() {
    fill(0, 255, 0); // green so it's different
    image(Health, this.x, this.y, 80, 65);
  }

  move() {
    this.y = this.y + this.speed;
  }
}

function obstacleSpawn() {
  if (obstacleTimer < 0) {
    let p = random(points);
    let img = random([Log, Tires]);

    obstacles.push(new Obstacle(p.x, 0, 50, obstacleSpeed, img));
    obstacleTimer = spawnRate; //timed so obstacles spawn faster according to play time
  }
  obstacleTimer--;
}

function lifeSpawn() {
  if (lifeTimer < 0 && random(1) < 0.01) {
    //1% Spawn
    let p = random(points);
    lifes.push(new Life(p.x, 0, 50, obstacleSpeed));
    lifeTimer = 200; // slower spawn
  }
  lifeTimer--;
}

//difficulty
function updateDifficulty() {
  if (survivalTime < 20) {
    difficultyLevel = 0; // Easy
    bgSpeed = 4;
    obstacleSpeed = 4;
    spawnRate = 40;
  } 
  else if (survivalTime < 40) {
    difficultyLevel = 1; // Medium
    bgSpeed = 5;
    obstacleSpeed = 5;
    spawnRate = 35;
  } 
  else if (survivalTime < 60) {
    difficultyLevel = 2; // Hard
    bgSpeed = 6;
    obstacleSpeed = 6;
    spawnRate = 25;
  } 
  else {
    difficultyLevel = 3; // Insane
    bgSpeed = 8;
    obstacleSpeed = 8;
    spawnRate = 15;
  }
}

function startScreen() {
  rectMode(CENTER);
  fill(50);
  rect(225, 330, 300, 220);

  fill(255);
  textAlign(CENTER);

  textSize(32);
  text("Subway Suffer", 225, 280);

  textSize(16);
  text("Use ← → or A / D to move", 225, 320);
  text("Avoid the LOGS & TIRES", 225, 345);
  text("Collect MEDKITS for health", 225, 370);

  textSize(16);
  text("Press SPACE to Start", 225, 410);
}

function failScreen() {
  if (playerLives == 0) {
    rectMode(CENTER);
    fill(50);
    rect(225, 330, 300, 190);

    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("You DIED :P", 225, 340);
    textSize(20);
    text("Time Survived: " + survivalTime + "s", 225, 380);
    text("Press F to Restart", 225, 290);
  }
}

function restartGame() {
  playerLives = 3;
  playerX = 225;
  obstacles = [];
  lifes = [];
  obstacleTimer = 120;
  lifeTimer = 180;

  startTime = millis(); //reset timer
  survivalTime = 0;
}