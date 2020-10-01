let pollutants = [];
let pollution;

let platforms = [];

let saplings = [], saplingsCount = 0, sapling_img;
let trees = [], treeCount = 0, tree_img;

let player, health = 100, player_img;
let jumpPower = 0;

let gameState = "start";

let acidRains = [], acidRain_img;

let menuScreen = "main";
let play, controls, story, back, pause, resume;
let pause_img, bg_img;

var start_music, main_music, click_music, gameover_music;

function preload() {
  tree_img = loadImage("tree.png");
  player_img = loadImage("player.png")
  sapling_img = loadImage("sapling.png");
  acidRain_img = loadImage("acidrain.png");
  pause_img = loadImage("pause.png");
  bg_img = loadImage("bg.jpg");
  start_music = loadSound("start.mp3");
  main_music = loadSound("main.mp3");
  click_music = loadSound("click.mp3");
  gameover_music = loadSound("gameover.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  player = createSprite(width / 2, -300, 10, 30);
  player.addImage(player_img);

  //making the buttons as sprites
  play = createSprite(width / 2, height / 4, width / 4, height / 8);
  play.shapeColor = "green";
  controls = createSprite(width / 2, height / 2, width / 4, height / 8);
  controls.shapeColor = "green";
  story = createSprite(width / 2, 3 * height / 4, width / 4, height / 8);
  story.shapeColor = "green";
  back = createSprite(width / 8, 7 * height / 8, width / 4, height / 8);
  back.shapeColor = "green";
  resume = createSprite(width / 2, height / 2, width / 4, height / 8);
  pause = createSprite(width - 50, 50, 50, 50);
  pause.addImage(pause_img);

  let xoff = 0,
    avgcol = 0;
  for (let i = 8; i < width; i += 16) {
    xoff += 0.1;
    let alpha = noise(xoff) * 100;
    avgcol += alpha;
    pollutants.push(new Pollutant(i, height - 70, alpha));
  }
  avgcol = avgcol / (xoff * 10);

  pollution = createSprite(width / 2, height - 35, width, 70);
  pollution.shapeColor = color(avgcol);

  start_music.play();
}

function draw() {

  if (gameState == "start") {
    background(bg_img);
    drawSprites();
    stroke('white')
    textAlign(CENTER, CENTER);
    fill("green");
    textSize(48);
    text("Pollution in Heaven", width / 2, 50);
    textSize(24);
    pollution.visible = false;
    pause.visible = false;
    resume.visible = false;

    if (mousePressedOver(play)) {
      play.destroy();
      play.visible = false;

      controls.destroy();
      controls.visible = false;

      story.destroy();
      story.visible = false;

      pollution.visible = true;
      pause.visible = true;

      gameState = "playing";

      main_music.play();
      start_music.stop();
    }

    if (mousePressedOver(back) && mouseWentDown("leftButton")) {
      menuScreen = "main";
      click_music.play();
      start_music.stop();
      start_music.play();
    }
    if (mousePressedOver(controls) && mouseWentDown("leftButton")) {
      menuScreen = "controls";
      click_music.play();
      start_music.stop();
      start_music.play();
    }
    
    if (mousePressedOver(story) && mouseWentDown("leftButton")) {
      menuScreen = "story";
      click_music.play();
      start_music.stop();
      start_music.play();
    }

    if (menuScreen == "main") {
      play.visible = true;
      story.visible = true;
      controls.visible = true;
      back.visible = false;
      text("Play", play.x, play.y);
      text("Controls", controls.x, controls.y);
      text("Story", story.x, story.y);
    } else {
      play.visible = false;
      story.visible = false;
      controls.visible = false;
      back.visible = true;
      text("Back", back.x, back.y);
    }

    if (menuScreen == "controls") {
      text("Controls:\nMove:- Left & Right Arrow\nFly:- Up Arrow\nPlant Trees:- Down Arrow", width / 2, height / 2);
    } else if (menuScreen == "story") {
      text("Yakhis (God of trees) have sent you to earth to reduce pollution there. \n But while going down you were shocked how much the pollution has risen and have became so deadly\n you were so shocked that you fell from the cloud that you were standing on. You somehow manage to escape \n but your magical stick was broken a little bit and you can’t\n fly for long and you need to recharge it by standing on a platform,\n the saplings that you brought with you are above on the cloud and they are falling from it.\n Now it’s upto you to plant many trees to reduce the pollution and not let it go to heaven.", width / 2, height / 2);
    }

  } else if (gameState == "playing") {
    background(200, 150, 50);

    jumpPower++;
    jumpPower = constrain(jumpPower, 0, 400);
    fill("green");
    rect(100, 0, map(jumpPower, 0, 400, 0, width / 3), 20);
    drawSprites();

    textSize(24);
    stroke(0);
    fill(0);
    text("Saplings\nRemaining: " + saplingsCount, 2 * width / 3, 50);
    text("Health: " + health, 2 * width / 3, 150);

    if (mousePressedOver(pause)) {
      gameState = "paused";
    }

    for (let i = 0; i < pollutants.length; i++)
      pollutants[i].display();

    spawnPlatform();
    spawnPlant();

    if (keyDown("UP_ARROW") && jumpPower > 50) {
      jumpPower -= 2;
      player.y -= 20;
    }

    if (health <= 0) {
      gameState = "lose";
      gameover_music.play();
    }

    if (keyWentDown("DOWN_ARROW") && saplingsCount > 0) spawnTrees();

    for (let i = 0; i < platforms.length; i++) {
      player.collide(platforms[i]);

      if (platforms[i].isTouching(player)) {
        platforms[i].shapeColor = "green";
      }

      if (platforms[i].y > height) {
        platforms[i].destroy();
        platforms.splice(i, 1);
      }

      for (let j = 0; j < trees.length; j++)
        trees[j].collide(platforms[i]);

      for (let j = 0; j < acidRains.length; j++) {
        if (acidRains[j].isTouching(platforms[i])) {
          acidRains[j].destroy();
          acidRains.splice(i, 1);
        }
      }
    }

    if (frameCount % 50 == 0) acidRain();

    for (let i = 0; i < acidRains.length; i++) {
      if (acidRains[i].y > height) {
        acidRains[i].destroy();
        acidRains.splice(i, 1);
      }

      if (player.isTouching(acidRains[i])) {
        health -= 10;
        acidRains[i].destroy();
        acidRains.splice(i, 1);
      }
    }

    for (let i = 0; i < saplings.length; i++) {

      for (let j = 0; j < platforms.length; j++)
        saplings[i].collide(platforms[j]);

      if (player.isTouching(saplings[i])) {
        saplings[i].destroy();
        saplings.splice(i, 1);
        saplingsCount++;
      }

      if (i == saplings.length) i--;

      if (saplings[i].y > height) {
        saplings[i].destroy();
        saplings.splice(i, 1);
      }
    }

    player.velocityY += 0.4;

    if (player.y > pollution.y) {
      gameState = "lose";
      gameover_music.play();
    }
    if (keyDown(LEFT_ARROW)) player.x -= 15;
    if (keyDown(RIGHT_ARROW)) player.x += 15;

    if (treeCount > 15) {
      gameState = "win";
      start_music.play();
    }

  } else if (gameState == "lose") {
    main_music.stop();
    for (let i = 0; i < World.allSprites.length; i++)
      World.allSprites[i].destroy();
    background(0);
    stroke('white')
    textAlign(CENTER, CENTER);
    fill("green");
    textSize(24);
    text("You have lost\nGo outside, spend some time with nature and try again!\nYou will certainly do better than last time.", width / 2, height / 2);
  } else if (gameState == "paused") {
    background(200, 150, 50);
    resume.visible = true;
    drawSprites();
    fill(255, 50);
    rect(0, 0, width, height);
    for (let i = 0; i < World.allSprites.length; i++)
      World.allSprites[i].setVelocity(0, 0);
    text("Resume", resume.x, resume.y);
    if (mousePressedOver(resume)) resumeGame();
    player.setVelocity(0, 0);
  } else if (gameState == "win") {
    background(bg_img);
    main_music.stop();
    stroke('white')
    textAlign(CENTER, CENTER);
    fill("green");
    textSize(24);
    text(`You Win!\nNow it's time to reduce pollution in real life.\n Plant a tree right now \nand ugre everyone in your faimly to plant a tree and take care fo it.\n It will make you fell really good.`, width / 2, height / 2);
  }
}

function resumeGame() {
  gameState = "playing";
  resume.visible = false;
  for (let i = 0; i < platforms.length; i++)
    platforms[i].setVelocity(0, 3);
  for (let i = 0; i < trees.length; i++)
    trees[i].setVelocity(0, 6);
  for (let i = 0; i < saplings.length; i++)
    saplings[i].setVelocity(0, 6);
  for (let i = 0; i < acidRains.length; i++)
    acidRains[i].setVelocity(0, 6);
}

function acidRain() {
  for (let i = 0; i < 5; i++) {
    let raindrop = createSprite(random(width), random(0, -height), 5, 10);
    raindrop.velocityY = 6;
    raindrop.addImage(acidRain_img);
    raindrop.scale = 2;
    acidRains.push(raindrop);
  }
}

function spawnTrees() {
  let tree = createSprite(player.x, player.y - 20, 10, 40);
  tree.addImage(tree_img);
  tree.scale = 2;
  tree.depth = pollution.depth - 1;
  treeCount++;
  saplingsCount--;
  tree.velocityY = 6;
  trees.push(tree);
}

function spawnPlant() {
  if (frameCount % 30 === 0) {
    let sapling = createSprite(random(50, width - 50), 0, 20, 20);
    sapling.addImage(sapling_img);
    sapling.velocityY = 6;
    saplings.push(sapling);
    sapling.depth = pollution.depth - 1;
  }
}

function spawnPlatform() {
  if (frameCount % 30 === 0) {
    let p = createSprite(random(width), 0, width / 2, 10);

    if (platforms.length == 0) p.x = width / 2;

    p.shapeColor = color(250, 115, 25);
    p.velocityY = 3;
    p.depth = pollution.depth - 1;
    platforms.push(p);
  }
}