let bullets = [];
let enemies = [];
let score = 0;
let zombiesEscaped = 0;
let round = 1; // Initialize the round variable
let zombieImage, zombieImage2, zombieImage3;
let playerImage, bulletImage, gunshotSound, bloodSplatterImg, gunshotImage, pauseImage, zombieDeathSound, backgroundSong;
let playerX = 350, playerY = 550;
let playerSpeed = 5;
let isMovingLeft = false, isMovingRight = false, isMovingUp = false, isMovingDown = false;
let bloodSpatters = [];
let gunshots = [];
let isPaused = false; // Pause state
let pauseButtonX = 40, pauseButtonY = 40, pauseButtonSize = 60; // Pause button position and size
let resumeButtonX, resumeButtonY, resumeButtonWidth = 250, resumeButtonHeight = 50; // Resume button properties
let gameStarted = false;

// For auto-shooting
let isMouseHeld = false; // Whether the mouse is being held down
let lastBulletTime = 0; // Tracks the last time a bullet was fired
const bulletCooldown = 200; // Time between bullets in milliseconds

function preload() {
  zombieImage = loadImage("zombie1.png");
  zombieImage2 = loadImage("zombie2.png");
  zombieImage3 = loadImage("zombie3.png");
  playerImage = loadImage("player.png");
  bulletImage = loadImage("bullet1.png");
  bloodSpatterImg = loadImage("bloodspatter.png");
  gunshotImage = loadImage("gunshot.png");
  pauseImage = loadImage("pause.png");
  gunshotSound = loadSound("gunshot.mp3");
  zombieDeathSound = loadSound("zombiedeath.mp3"); // Load the zombie death sound
  backgroundSong = loadSound("Loonboon.mp3"); //loads the background song
}

function setup() {
  createCanvas(700, 600);
  for (let i = 0; i < 16; i++) {
    spawnZombie();
  }

  // Center the canvas
  let canvasElement = document.querySelector("canvas");
  canvasElement.style.position = "absolute";
  canvasElement.style.top = "50%";
  canvasElement.style.left = "50%";
  canvasElement.style.transform = "translate(-50%, -50%)";
  canvasElement.style.border = "5px solid rgb(0,131,4)";
  strokeWeight('2');

  // Set resume button position
  resumeButtonX = width / 2 - resumeButtonWidth / 2;
  resumeButtonY = height / 2 + 50;

  // Set the font for game text (similar to title screen)
  textFont('Gill Sans'); // Set font to Gill Sans (as used in title screen)
  textSize(30); // Set text size
}


function draw() {
  if(!gameStarted){
    return;
  }
  if (isPaused) {
    drawPauseScreen();
    return; // Skip the rest of the game logic
  }

  clear();
  if (isMovingLeft) playerX -= playerSpeed;
  if (isMovingRight) playerX += playerSpeed;
  if (isMovingUp) playerY -= playerSpeed;
  if (isMovingDown) playerY += playerSpeed;
  playerX = constrain(playerX, 150, width - 150);
  playerY = constrain(playerY, 100, height - 100);

  let angleToMouse = atan2(mouseY - playerY, mouseX - playerX);

  // Draw player
  push();
  translate(playerX, playerY);
  rotate(angleToMouse + Math.PI / 2);
  imageMode(CENTER);
  image(playerImage, 0, 0, 75, 75);
  pop();
  
  // Check for auto-shooting (holding the mouse)
  if (isMouseHeld && millis() - lastBulletTime > bulletCooldown) {
    // Fire a new bullet if cooldown has passed
    let angle = atan2(mouseY - playerY, mouseX - playerX);
    let bullet = { x: playerX, y: playerY, angle: angle };
    bullets.push(bullet);
    gunshots.push({ angle: angle, startTime: millis() });
    if (gunshotSound.isLoaded()) gunshotSound.play();
    lastBulletTime = millis(); // Update last bullet time
  }

  // Draw bullets
  for (let bullet of bullets) {
    bullet.x += cos(bullet.angle) * 20;
    bullet.y += sin(bullet.angle) * 20;
    push();
    translate(bullet.x, bullet.y);
    rotate(bullet.angle + Math.PI / 2);
    imageMode(CENTER);
    image(bulletImage, 0, -20, 20, 30);
    pop();
  }

  // Draw gunshots
  for (let i = gunshots.length - 1; i >= 0; i--) {
    const gunshot = gunshots[i];
    if (millis() - gunshot.startTime > 100) {
      gunshots.splice(i, 1);
    } else {
      push();
      translate(playerX, playerY);
      rotate(gunshot.angle + Math.PI / 2);
      imageMode(CENTER);
      image(gunshotImage, 0, -60, 60, 60);
      pop();
    }
  }

  // Draw enemies
  for (let enemy of enemies) {
    if (enemy.type === "zombie1") enemy.x += random(-1.5, 1.5);
    enemy.y += enemy.speed;

    imageMode(CENTER);
    if (enemy.type === "zombie1") image(zombieImage, enemy.x, enemy.y, 60, 60);
    else if (enemy.type === "zombie2") image(zombieImage2, enemy.x, enemy.y, 100, 100);
    else if (enemy.type === "zombie3") image(zombieImage3, enemy.x, enemy.y, 125, 125);

    drawHealthBar(enemy);

    if (enemy.y > height) {
  enemies.splice(enemies.indexOf(enemy), 1);
  zombiesEscaped++;
  if (zombiesEscaped >= 5) {
    noLoop(); // Stop the game loop to prevent further updates
  }

  if (zombiesEscaped >= 5) {
    // Draw "You Lose!" message
    textSize(40);
    textAlign(CENTER);
    fill(255); // White fill for the rectangle
    stroke(255, 0, 0); // Red border for the rectangle
    strokeWeight(4); // Border thickness
    rectMode(CENTER);

    // Draw the rectangle (slightly wider and taller than the text)
    let rectWidth = 300;
    let rectHeight = 100;
    rect(width / 2, height / 2, rectWidth, rectHeight, 15); // Rounded rectangle corners

    // Draw the "You Lose!" text
    noStroke(); // Remove border for text
    fill(255, 0, 0); // Red text
    text("You Lose!", width / 2, height / 2 - 10);

    noLoop();
  }
    }
  }
  
  function mousePressed() {
  // When the mouse is pressed, start auto-shooting
  isMouseHeld = true;
}

function mouseReleased() {
  // When the mouse is released, stop auto-shooting
  isMouseHeld = false;
}
if(bullets.length > 50) {
  bullets.splice(0, bullets.length - 50);
  console.log(bullets)
}
  // Handle collisions
  for (let enemy of enemies) {
    for (let bullet of bullets) {
      if (dist(enemy.x, enemy.y, bullet.x, bullet.y) < 40) {
        console.log(bullets)
        bullets.splice(bullets.indexOf(bullet), 1);
        enemy.hits--;
        if (enemy.hits <= 0) {
          bloodSpatters.push({ x: enemy.x, y: enemy.y, opacity: 255, timer: millis() });
          console.log(enemies)
          enemies.splice(enemies.indexOf(enemy), 1);

          // Play zombie death sound
          if (zombieDeathSound.isLoaded()) {
            zombieDeathSound.play();
          }

          if (score >= 125 && random() < 0.1) spawnZombie("zombie3");
          else if (score >= 50 && random() < 0.3) spawnZombie("zombie2");
          else spawnZombie("zombie1");
          score++;
          
          // Check for a new round
          if (score % 60 === 0) {
            round++; // Increment the round
            spawnNewZombies(); // Spawn additional zombies for the new round
          }
        }
        break;
      }
    }
  }

  // Draw blood spatters
  for (let i = bloodSpatters.length - 1; i >= 0; i--) {
    let blood = bloodSpatters[i];
    if (millis() - blood.timer > 3000) {
      bloodSpatters.splice(i, 1);
    } else {
      imageMode(CENTER);
      tint(255, blood.opacity);
      image(bloodSpatterImg, blood.x, blood.y, 100, 100);
      blood.opacity -= 5;
      noTint();
    }
  }

  // Display score, escaped count, and round
  textSize(30);
  textAlign(CENTER, TOP);
  fill('rgb(255,255,255)');
  text(`Score: ${score}`, width / 2, 20);
  textSize(30);
  textAlign(CENTER, TOP);
  fill('rgb(255,255,255)');
  text(`Escaped: ${zombiesEscaped}/5`, width / 2, 70);
  textSize(30);
  textAlign(CENTER, TOP);
  fill('rgb(255,255,255)');
  text(`Round: ${round}`, width / 2, 120);

  // Draw pause button
  image(pauseImage, pauseButtonX, pauseButtonY, pauseButtonSize, pauseButtonSize);
}

function spawnNewZombies() {
  for (let i = 0; i < 2 + round * 2; i++) {
    spawnZombie(); // Spawn more zombies as rounds progress
  }
}

function drawPauseScreen() {
  background(0, 0, 0, 150); // Dim the screen
  textSize(50);
  textAlign(CENTER);
  fill(255);
  text("PAUSED", width / 2, height / 2 - 20);

  // Draw "Resume Game" button
  fill("green");
  rectMode(CENTER);
  rect(resumeButtonX + resumeButtonWidth / 2, resumeButtonY + resumeButtonHeight / 2, resumeButtonWidth, resumeButtonHeight, 10);
  fill(0);
  textSize(30);
  text("Resume Game", width / 2, resumeButtonY + resumeButtonHeight / 2 - 15);
}

function drawHealthBar(enemy) {
  const barHeight = 40;
  const barWidth = 10;
  const maxHealth = enemy.type === "zombie1" ? 3 : enemy.type === "zombie2" ? 2 : 15;
  const healthPercentage = enemy.hits / maxHealth;

  let barColor;
  if (healthPercentage > 0.66) barColor = color(0, 255, 0);
  else if (healthPercentage > 0.33) barColor = color(255, 255, 0);
  else barColor = color(255, 0, 0);

  fill(barColor);
  rectMode(CENTER);
  rect(enemy.x - 40, enemy.y + 10, barWidth, barHeight * healthPercentage);
}

function mousePressed() {
  if (isPaused) {
    // Check if "Resume Game" button is clicked
    if (
      mouseX > resumeButtonX &&
      mouseX < resumeButtonX + resumeButtonWidth &&
      mouseY > resumeButtonY &&
      mouseY < resumeButtonY + resumeButtonHeight
    ) {
      isPaused = false;
    }
  } else {
    // Check if pause button is clicked
    if (
      mouseX > pauseButtonX &&
      mouseX < pauseButtonX + pauseButtonSize &&
      mouseY > pauseButtonY &&
      mouseY < pauseButtonY + pauseButtonSize
    ) {
      isPaused = true;
    } else {
      let angle = atan2(mouseY - playerY, mouseX - playerX);
      let bullet = { x: playerX, y: playerY, angle: angle };
      bullets.push(bullet);
      gunshots.push({ angle: angle, startTime: millis() });
      if (gunshotSound.isLoaded()) gunshotSound.play();
    }
  }
}

function keyPressed() {
  if (key === "a" || key === "A") isMovingLeft = true;
  if (key === "d" || key === "D") isMovingRight = true;
  if (key === "w" || key === "W") isMovingUp = true;
  if (key === "s" || key === "S") isMovingDown = true;
}

function keyReleased() {
  if (key === "a" || key === "A") isMovingLeft = false;
  if (key === "d" || key === "D") isMovingRight = false;
  if (key === "w" || key === "W") isMovingUp = false;
  if (key === "s" || key === "S") isMovingDown = false;
}

function spawnZombie(type = "zombie1") {
  let newEnemy; // Variable to temporarily store the new zombie's properties
  let overlapping; // Flag to check if the new zombie overlaps with existing ones

  do {
    // Loop to ensure the new zombie doesn't overlap with others
    overlapping = false; // Reset overlapping flag for each attempt

    // Define the properties of the new zombie
    newEnemy = {
      x: random(150, width - 150), // Random horizontal position within game boundaries
      y: random(-800, 0), // Random vertical position off-screen, above the canvas
      speed: type === "zombie1" 
        ? random(0.4, 1.0) // Slow speed for zombie1
        : type === "zombie2" 
        ? random(4, 5) // Fast speed for zombie2
        : random(0.1, 0.5), // Very slow speed for zombie3
      hits: type === "zombie1" 
        ? 3 // 3 hits to kill zombie1
        : type === "zombie2" 
        ? 2 // 2 hits to kill zombie2
        : 15, // 15 hits to kill zombie3
      type: type // Type of the zombie (zombie1, zombie2, or zombie3)
    };

    // Check if the new zombie overlaps with any existing zombies
    for (let enemy of enemies) {
      // Calculate the distance between the new zombie and an existing zombie
      if (dist(newEnemy.x, newEnemy.y, enemy.x, enemy.y) < 100) {
        // If the distance is less than 100 pixels, it's considered overlapping
        overlapping = true; // Set overlapping flag to true
        break; // Exit the loop as we only need to detect one overlap
      }
    }
  } while (overlapping); // Repeat the loop if the zombie overlaps with another

  enemies.push(newEnemy); // Add the new zombie to the enemies array
}

// Event listener for the Start Game button
document.getElementById("startButton").addEventListener("click", function () {
  document.getElementById("titleScreen").style.display = "none"; // Hide the title screen
  document.getElementById("gameCanvasContainer").style.display = "block"; // Show the game canvas
  gameStarted = true;
  
  // Start the game after 2-second delay
  setTimeout(() => {
    gameStarted = true;

    // Play the background song
    if (backgroundSong.isLoaded()) {
      backgroundSong.loop();
    }
  }, 2000);

});

