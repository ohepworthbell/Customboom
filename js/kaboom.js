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
	tabletop = 140;

/* set up canvas */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

/* some global variables */
var raf, 												//  Request animation frame
	i, 													//  General counter
	move, 												//  Used to get mouse/finger positions
	touchobj,											//  Used for calculating finger position
	relw, 												//  Find canvas relative width (for responsive calculations)
	relmove,											//  Convert positions into responsive positions
	tinimg,												//  Load tin image
	start=0,											//  Detect whether the game has started
	speed=10,											//  Default speed (acceleration/a)
	rightbound = canvas.width-edges, 					//  Max play boundry to left of canvas
	platform = canvas.height-tabletop,					//  Max play boundry to right of canvas
	life=3,												//  Lives remaining (can be set to any value)
	score=0,											//  Current score
	checkpoint=0,										//	Used to track score relative checkscore, for speeding up acceleration
	checkscore=5,										//	How many points between between acceleration boosts
	scorebox=document.getElementById('score');			//  Simple 'Score' box
	lifebox=document.getElementById('lives');			//  Simple 'Lives Remaining' box


/* Generate a 'tomato' */
var tomato = {
	/*	Generate a random position between the pre-defined boundaries */
	x: edges + parseInt((rightbound-edges)*Math.random()),
	y: -500,
	a: speed,
	radius: 25,
	opacity: 1,
	color: '#ec3e31',
	draw: function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}


/* generate tin image */
var tinimg = document.createElement('img');

tinimg.addEventListener('load', function() {
	ctx.drawImage(tinimg,((canvas.width-40)/2),platform-40,80,80);
}, false);

tinimg.src = '.\/img\/tin.png';


/* Generate the 'catching' tin */
var tin =  {
	x: (canvas.width/2),
	y: platform,

	draw: function() {
		ctx.drawImage(tinimg,this.x-40,this.y-40,80,80);
	}
}


/*	For every time a life is lost
 */
function lifeLost(life) {
	if(life==1) {
		lifebox.innerHTML = 'You lost a life! You have '+life+' life remaining';

		reset();
	}
	else if(life<1) {
		lifebox.innerHTML = '<span class=\'red\'>GAME OVER<\/span>';

		tomato.color = 'transparent';
		tomato.a = 0;
	}
	else {
		lifebox.innerHTML = 'You lost a life! You have '+life+' lives remaining';

		reset();
	}
}


/*	Function to increase scores
 */
function addScore(score) {
	scorebox.innerHTML = 'Score: '+score;
}


/*	This fuction simply restarts the animation by moving the ball back to the top
 *	of the screen and re-calculated a random x-position. Admittedly poor workaround
 */
function reset() {
	tomato.y = -500;
	tomato.x = edges + parseInt((rightbound-edges)*Math.random());
	}


function draw() {
	ctx.clearRect(0,0, canvas.width, canvas.height);

	/* Only check this function when the tomato gets to the correct height */
	if(tomato.y>(platform-40) && tomato.y<(platform+10)) {

		/* now check the position of the tomato relative to the tin (with a leeway of +/- 25px) */
		if(tomato.x<relmove+25 && tomato.x>relmove-25) {

			/* add up the score */
			score++;
			addScore(score);

			/* test to see if there needs to be an acceleration boost */
			if(score==(checkpoint+checkscore)) {
				tomato.a++;
				checkpoint=score;
			}

			reset();
		}
	}

	/* Check tomato hasn't reached end of canvas, reset animation if it has.
	 * When a tomato reaches the bottom, you also lose a point.
	 */
	if (tomato.y > (canvas.height+20)) {
		/* lose that life, sucka! */
		life--;
		lifeLost(life);

		/* But to make the game fair, let's slow things back down */
		tomato.a=speed
	}

	/* generate content */
	tomato.draw();
	tin.draw();

	/* get next animation step */
	tomato.y += tomato.a;

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
	tin.x = relmove;
}


/* begin the game on mouseover */
canvas.addEventListener('click', function(e){
	if(start==0) {
		start=1;
		raf = window.requestAnimationFrame(draw);

		/* Hide the cursor for the game (for now - will add it back in for menu options) */
		canvas.style.cursor = 'none';
	}
});


/* Additional start touch-screen devices */
canvas.addEventListener('touchstart', function(e){
	if(start==0) {
		start=1;
		raf = window.requestAnimationFrame(draw);

		/* Hide the cursor for the game (for now - will add it back in for menu options) */
		canvas.style.cursor = 'none';
	}
});

/* set up the game */
tomato.draw();
tin.draw();
