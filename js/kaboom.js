/*
 *  Customboom! v0.1
 *
 *  Basic game to catch falling elements
 *  Pure JavaScript (vanilla - no dependencies)
 *  Requires canvas support (IE9+, all versions of Chrome, Firefox and Safari)
 */

/*  Set the edge width and the tabletop height (from bottom of screen)
 *
 *  NOTE: You can set the width and height of the canvas to whatever you want, as well as the height of the "tabletop"
 *  and the script will simply rescale the playable area to accomodate.
 */

var edges = 50,
    tabletop = 160;

/* set up canvas */
var canvas = document.getElementById("customboom");
var ctx = canvas.getContext("2d");

/* some global variables */
var raf,                                           //  Request animation frame
    i,                                             //  General counter
    move,                                          //  Used to get mouse/finger positions
    touchobj,                                      //  Used for calculating finger position
    relw,                                          //  Find canvas relative width (for responsive calculations)
    relmove,                                       //  Convert positions into responsive positions
    start = 0,                                     //  Detect whether the game has started
    speed = 8,                                     //  Default speed (acceleration/a)
    paused = false,                                //  State whether the game is paused or not
    rightbound = canvas.width-edges,               //  Max play boundry to left of canvas
    platform = canvas.height-tabletop,             //  Max play boundry to right of canvas
    life = 3,                                      //  Lives remaining (can be set to any value)
    score = 0,                                     //  Current score
    checkpoint = 0,                                //  Used to track score relative checkscore, for speeding up acceleration
    checkscore = 5,                                //  How many points between between acceleration boosts
    showlives=document.getElementById("lives"),    //  Simple box to record lives visibly in browser
    showscore=document.getElementById("score"),    //  Simple box to record score visibly in browser
    pixelSize = 5,                                 //  Size of pixels - basically a grid. Should ideally match up with image pixelation!
    isKeyPressed = false;                          //  Test keypress (to pause games, etc.)


/* some script to pixelate an image (for that retro feel) */
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;



/* generate ball image */
var ballImg = document.createElement("img");

/* Generate the ball (proper) */
var ball = {
  /*  Generate a random position between the pre-defined boundaries */
  x: edges + (rightbound-edges)*Math.random(),
  y: -500,
  ny: -500,
  a: speed,
  opacity: 1,
  draw: function() {
    ctx.drawImage(
      ballImg,
      this.x-(pixelSize*ballImg.width/2),
      this.ny-ballImg.height,
      ballImg.width*pixelSize,
      ballImg.height*pixelSize
    );
  }
}

ballImg.src = ".\/img\/ball.png";


/* generate tin image */
var tinimg = document.createElement("img");

tinimg.addEventListener("load", function() {
  ctx.drawImage(
    tinimg,
    (canvas.width-(pixelSize*tinimg.width/2))/2,
    platform-(pixelSize*tinimg.height/2),
    tinimg.width*pixelSize,
    tinimg.height*pixelSize
  );
}, false);

tinimg.src = ".\/img\/tin.png";


/* Generate the "catching" tin */
var tin =  {
  x: (canvas.width/2),
  y: platform,

  draw: function() {
    ctx.drawImage(
      tinimg,
      this.x-(pixelSize*tinimg.width/2),
      this.y-(pixelSize*tinimg.height/2),
      tinimg.width*pixelSize,
      tinimg.height*pixelSize
    );
  }
}


/*  This fuction simply restarts the animation by moving the ball back to the top
 *  of the screen and re-calculated a random x-position. Admittedly poor workaround
 */
function reset() {
  ball.y = -500;
  ball.ny = -500;
  ball.x = edges + parseInt((rightbound-edges)*Math.random());
  }


function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);

  /* Only check this function when the ball gets to the correct height */
  if(ball.y>(platform-(pixelSize*tinimg.height/1.5)) && ball.y<(platform+pixelSize)) {

    /* now check the position of the ball relative to the tin (with a leeway of +/- 60%) */
    if(ball.x<relmove+((tinimg.width*pixelSize)/1.666) && ball.x>relmove-((tinimg.width*pixelSize)/1.666)) {

      /* add up the score */
      score++;
      showscore.innerHTML = "Caught! Your score is now "+score;

      /* test to see if there needs to be an acceleration boost */
      if(score==(checkpoint+checkscore)) {
        ball.a++;
        checkpoint=score;
      }

      reset();
    }
  }

  /* Check ball hasn"t reached end of canvas, reset animation if it has.
   * When a ball reaches the bottom, you also lose a point.
   */
  if (ball.y > (canvas.height+20)) {
    /* lose that life, sucka! */
    life--;

    /* But to make the game fair, let"s slow things back down */
    ball.a=speed;

    if(life==1) {
      showlives.innerHTML = "You lost a life! You have "+life+" life remaining";

      reset();
    }
    else if(life<1) {
      showlives.innerHTML = "GAME OVER! You have no more lives remaining";

      ball.color = "transparent";
      ball.a = 0;
    }
    else {
      showlives.innerHTML = "You lost a life! You have "+life+" lives remaining";

      reset();
    }
  }

  /* generate content */
  ball.draw();
  tin.draw();

  /* get next animation step */
  ball.y += ball.a;
  ball.ny = pixelSize*Math.floor(ball.y/pixelSize);

  if(!paused) {
    raf = window.requestAnimationFrame(draw);
  }
}


/* get the current mouse/finger position within the canvas */
canvas.addEventListener("mousemove", function(e){
  move = e.clientX - canvas.getBoundingClientRect().left;
  moveTin(move);
});

canvas.addEventListener("touchmove", function(e){
  touchobj = e.changedTouches[0];
  move = touchobj.clientX - canvas.offsetLeft;
  moveTin(move);
});


/* This is the function to move the tin, using the variables from above */
function moveTin(move) {
  /*  Since the canvas may be responsive, we must get the
   *  real width and find out the difference between that
   *  and the default width and calculate the difference
   */
  relw = canvas.width/canvas.offsetWidth;

  relmove=parseInt(relw*move);

  /* add in the boundaries (calculated at the start) */
  if(relmove<edges) {
    relmove = edges;
  }
  else if(relmove>rightbound) {
    relmove = rightbound;
  }

  /* make the tin move */
  tin.x = pixelSize*Math.floor(relmove/pixelSize);
}


/* begin the game on mouseover */
canvas.addEventListener("click", function(){
  if(start==0) {
    start=1;
    raf = window.requestAnimationFrame(draw);

    /* Hide the cursor for the game (for now - will add it back in for menu options) */
    canvas.style.cursor = "none";

    /* Quickly check score and lives are correctly set */
    showscore.innerHTML = "Your current score is "+score;
  }
});


/* Additional start touch-screen devices */
canvas.addEventListener("touchstart", function(){
  if(start==0) {
    start=1;
    raf = window.requestAnimationFrame(draw);

    /* Hide the cursor for the game (for now - will add it back in for menu options) */
    canvas.style.cursor = "none";

    /* Quickly check score and lives are correctly set */
    showscore.innerHTML += "Your current score is "+score;
  }
});

/* set up the game */
ball.draw();
tin.draw();


/* allow the game to be paused or unpaused */

document.body.onkeyup = function(e){
  /* Check which keys have been pressed, and whether they pause the game:
   *
   * 32 (spacebar)
   * 27 (escape)
   * 13 (return)
   * 80 (p)
   */
  if(e.keyCode === 32 || e.keyCode === 27 || e.keyCode === 13 || e.keyCode === 80) {
    isKeyPressed = true;
  } else {
    isKeyPressed = false;
  };

  if(isKeyPressed) {
    e.preventDefault();

    /* Check to see whether game is paused, then toggle the 'paused' variable */
    if(!paused) {
      paused=true;
      /* Enable cursor again */
      canvas.style.cursor = "default";
    }

    /* If the game is already paused, then resume */
    else {
      paused=false;
      /* Hide cursor as game continues */
      canvas.style.cursor = "none";
      raf = window.requestAnimationFrame(draw);
    }
  }
}
