/*
 *	Customboom! v0.1
 *
 *	Basic game to catch falling elements
 *	Pure JavaScript (vanilla - no dependencies)
 *	Requires canvas support (IE9+, all versions of Chrome, Firefox and Safari)
 */

/*	Set the edge width and the tabletop height (from bottom of screen)
 *
 *	NOTE: You can set the width and height of the canvas to whatever you want, as well as the height of the 'tabletop'
 *	and the script will simply rescale the playable area to accomodate.
 */
var edges = 200,
	tabletop = 130;

/* set up canvas */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

/* some global variables */
var raf, 											              		  //  Request animation frame
	i, 												                		  //  General counter
	move, 											              		  //  Used to get mouse/finger positions
	touchobj,										              		  //  Used for calculating finger position
	relw, 											              		  //  Find canvas relative width (for responsive calculations)
	relmove,										              		  //  Convert positions into responsive positions
	tinimg,											              		  //  Load tin image
	start=0,										              		  //  Detect whether the game has started
	speed=8,										              		  //  Default speed (acceleration/a)
	rightbound = canvas.width-edges, 				  		  //  Max play boundry to left of canvas
	platform = canvas.height-tabletop,						  //  Max play boundry to right of canvas
	life=3,											              		  //  Lives remaining (can be set to any value)
	score=0,										              		  //  Current score
	checkpoint=0,									            		  //	Used to track score relative checkscore, for speeding up acceleration
	checkscore=5,									            		  //	How many points between between acceleration boosts
	audit=document.getElementById('gametrail'),		  //  Simple box to record data visibly in browser
  pixelSize=5;                                    //  Size of pixels - basically a grid. Should ideally match up with image pixelation!


/* generate ball image */
var ballImg = document.createElement('img');

/* Generate the ball (proper) */
var ball = {
	/*	Generate a random position between the pre-defined boundaries */
	x: edges + (rightbound-edges)*Math.random(),
	y: -500,
  ny: -500,
	a: speed,
	opacity: 1,
  draw: function() {
		ctx.drawImage(ballImg,this.x-25,this.ny-50,50,50);
	}
}

ballImg.src = '.\/img\/ball.png';


/* generate tin image */
var tinimg = document.createElement('img');

tinimg.addEventListener('load', function() {
	ctx.drawImage(tinimg,((canvas.width-50)/2),platform-50,100,100);
}, false);

tinimg.src = '.\/img\/tin.png';


/* Generate the 'catching' tin */
var tin =  {
	x: (canvas.width/2),
	y: platform,

	draw: function() {
		ctx.drawImage(tinimg,this.x-50,this.y-50,100,100);
	}
}


/*	This fuction simply restarts the animation by moving the ball back to the top
 *	of the screen and re-calculated a random x-position. Admittedly poor workaround
 */
function reset() {
	ball.y = -500;
  ball.ny = -500;
	ball.x = edges + parseInt((rightbound-edges)*Math.random());
	}


function draw() {
	ctx.clearRect(0,0, canvas.width, canvas.height);

	/* Only check this function when the ball gets to the correct height */
	if(ball.y>(platform-30) && ball.y<(platform+(15+pixelSize))) {

		/* now check the position of the ball relative to the tin (with a leeway of +/- 25px) */
		if(ball.x<relmove+(25+pixelSize) && ball.x>relmove-(25+pixelSize)) {

			/* add up the score */
			score++;
			audit.innerHTML = '<p>Caught! Your score is now '+score+'<\/p>';

			/* test to see if there needs to be an acceleration boost */
			if(score==(checkpoint+checkscore)) {
				ball.a++;
				checkpoint=score;
			}

			reset();
		}
	}

	/* Check ball hasn't reached end of canvas, reset animation if it has.
	 * When a ball reaches the bottom, you also lose a point.
	 */
	if (ball.y > (canvas.height+20)) {
		/* lose that life, sucka! */
		life--;

		/* But to make the game fair, let's slow things back down */
		ball.a=speed

		if(life==1) {
			audit.innerHTML = '<p>You lost a life! You have '+life+' life remaining<\/p>';

			reset();
		}
		else if(life<1) {
			audit.innerHTML = '<p>GAME OVER<\/p>';

			ball.color = 'transparent';
			ball.a = 0;
		}
		else {
			audit.innerHTML = '<p>You lost a life! You have '+life+' lives remaining<\/p>';

			reset();
		}
	}

	/* generate content */
	ball.draw();
	tin.draw();

	/* get next animation step */
	ball.y += ball.a;
  ball.ny = pixelSize*Math.floor(ball.y/pixelSize);

	raf = window.requestAnimationFrame(draw);
}


/* get the current mouse/finger position within the canvas */
canvas.addEventListener('mousemove', function(e){
	move = e.clientX - canvas.getBoundingClientRect().left;
	moveTin(move);
});

canvas.addEventListener('touchmove', function(e){
	touchobj = e.changedTouches[0];
	move = touchobj.clientX - canvas.offsetLeft;
	moveTin(move);
});


/* This is the function to move the tin, using the variables from above */
function moveTin(move) {
	/*	Since the canvas may be responsive, we must get the
	 *	real width and find out the difference between that
	 *	and the default width and calculate the difference
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
	tin.x = pixelSize * Math.floor(relmove/pixelSize);
}


/* begin the game on mouseover */
canvas.addEventListener('click', function(e){
	if(start==0) {
		start=1;
		raf = window.requestAnimationFrame(draw);

		/* Hide the cursor for the game (for now - will add it back in for menu options) */
		canvas.style.cursor = 'none';

		/* Quickly check score and lives are correctly set */
		audit.innerHTML += '<p>You current score is '+score+'. You have '+life+' lives.<\/p>';
	}
});


/* Additional start touch-screen devices */
canvas.addEventListener('touchstart', function(e){
	if(start==0) {
		start=1;
		raf = window.requestAnimationFrame(draw);

		/* Hide the cursor for the game (for now - will add it back in for menu options) */
		canvas.style.cursor = 'none';

		/* Quickly check score and lives are correctly set */
		audit.innerHTML += '<p>You current score is '+score+'. You have '+life+' lives.<\/p>';
	}
});

/* set up the game */
ball.draw();
tin.draw();
