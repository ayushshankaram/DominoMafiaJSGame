// SOUNDS
var music1 = new Audio('./sound/bcgsound.mp3');
music1.volume = 0.2;
music1.loop = true;

var myGunshot = new Audio('sound/gunShot.mp3');
var enemyFalling = new Audio('audio/thud.m4a');
var bulletPang = new Audio('audio/b.mp3');

var enemyGunshot = new Audio('audio/laser_sound.m4a');
enemyGunshot.volume = 0.4;

var chopperNoise = new Audio('audio/chopper.mp3');
chopperNoise.volume = .7;
chopperNoise.loop = true;

var flatTire = new Audio('audio/flatTire.mp3');
flatTire.volume = .3;

var crash = new Audio('audio/explosion.mp3');
crash.volume = .7;


// SOME ESSENTIAL VARIABLES
const gameFrame = document.querySelector("#gameFrame");

var myLifePoints = 100;
var enemyShotDamage = 20;
var enemyShotsTimeout;

function livingEnemies() {
	return document.querySelectorAll(".level.current .enemy:not(.dead)");
}


// ENEMY SHOOTS ME
function enemyShootsMe(enemy) {
	if(enemy) {
		enemy.classList.add("showing");
		setTimeout(function() {
			if(!enemy.classList.contains("dead")) {
				enemyGunshot.play();
				enemy.classList.add("shooting");
				gameFrame.classList.add("enemyShooting");
				updateLifePoints(myLifePoints - enemyShotDamage);
				setTimeout(function() {
					enemy.classList.remove("shooting");
					gameFrame.classList.remove("enemyShooting");
					setTimeout(function() {
						enemy.classList.remove("showing");
					}, 150);
				}, 500);
			}
		}, 1000);
	}
}

// ELEMENT OF SURPRISE
function randomEnemyShots() {

	if(myLifePoints > 0) {

		if(livingEnemies()) {
			var randomEnemy = Math.floor(Math.random() * livingEnemies().length);
			var randomDelay = Math.floor(Math.random() * 2000) + 500;

			enemyShotsTimeout = setTimeout(function() {
				if(myLifePoints > 0) {
					enemyShootsMe(livingEnemies()[randomEnemy]);
					randomEnemyShots();					
				}
			}, randomDelay);
		}

	}

}


// DAMAGE AND DEATH
function updateLifePoints(amount) {
	myLifePoints = amount;
	if(myLifePoints < 1) {
		myLifePoints = 0;
		setTimeout(function() {
			if(livingEnemies().length) {
				music1.volume = 1;
				gameFrame.classList.add("playerDead");
			}
		}, 500);
	}
	if(myLifePoints > 100) myLifePoints = 100;
	document.getElementById("healthBar").style.width = myLifePoints+"%";
}

function getNextLevel() {
	return document.querySelector(".level:not(.current):not(.past)");	
}


// I SHOOT THE ENEMIES
function iShoot(enemy) {

	/* Consequences on the enemies */
	enemy.classList.remove("shooting");
	enemy.classList.remove("showing");
	enemy.classList.add("dead");
	setTimeout(function() {
		enemyFalling.play();
	}, 300);

	assessVictory();
}

// VISUAL AND SOUND EFFECTS WHEN I SHOOT
function myShootingEffects() {
	myGunshot.play();
	gameFrame.classList.add("playerShooting");
	setTimeout(function() {
		gameFrame.classList.remove("playerShooting");
	}, 150);
}


// DID I WIN?
function assessVictory() {
	/* Victory! */
	if(!livingEnemies().length) {
		setTimeout(function() {

			// Is there a further level
			if(getNextLevel()) {
				var currentLevel = document.querySelector(".level.current");
				currentLevel.classList.add("past");
				currentLevel.classList.remove("current");
				getNextLevel().classList.add("current");
				updateLifePoints(myLifePoints+40);

				// Level 3 intervals
				if(document.querySelector(".level.current").id == 'level3') {
					setTimeout(function() {
						document.querySelector("#garageDoor").classList.add("open");
					}, 1000);
					setTimeout(function() {
						level3intervals();
					}, 2000);
				}

				// Level 4 functions
				if(document.querySelector(".level.current").id == 'level4') {
					level4intervals();
					clearLevel3intervals();
				}

				// Reseting random attacks
				clearTimeout(enemyShotsTimeout);
				setTimeout(function() {
					randomEnemyShots()
				}, 4500);
			}
			else {
				music1.volume = 1;
				setTimeout(function() {
					gameFrame.classList.add("playerWon");
				}, 1000);
			}

		}, 300);
	}	
}


// GETTING THE GAME READY
function newGame() {

	clearTimeout(enemyShotsTimeout);

	document.querySelectorAll(".enemy").forEach(enemy => {
		enemy.classList = ["enemy"];			
	});
	document.querySelectorAll(".truck").forEach(truck => {
		truck.classList = ["truck"];			
	});
	document.querySelectorAll(".bulletImpact").forEach(bulletImpact => {
		bulletImpact.remove();			
	});

	// if(document.querySelector(".level.current").id == 'level4') {
	// 	level4intervals();
	// }


	// Reset levels
	// document.querySelectorAll(".level").forEach(level => {
	// 	level.classList = ["level"];
	// });
	// document.querySelectorAll(".level")[0].classList.add("current");

	updateLifePoints(100);
	gameFrame.classList = [];

	// music1.currentTime = 0;
	music1.volume = 0.2;
	music1.play();

	setTimeout(function() {
		randomEnemyShots();
	}, 4000);

}


document.querySelectorAll('.enemy').forEach(enemy => {

	enemy.addEventListener("click", function() {
		iShoot(enemy);
	});

});

document.querySelectorAll(".wall, .panel").forEach(wall => {

	wall.addEventListener("click", function(e) {
		if(!wall.classList.contains('helice')) {
			wall.innerHTML += "<div class='bulletImpact' style='top: "+e.offsetY+"px; left: "+e.offsetX+"px;'></div>";
		}
		setTimeout(function() {
			bulletPang.play();
		}, 50);
	});

});


// LEVEL 3

function level3intervals() {
	roadMovingInterval = setInterval(function() {
		innerRoad = document.querySelector(".current .obstacle.road .inner");
		innerRoad.style.backgroundPositionY = (parseInt(innerRoad.style.backgroundPositionY) - 20) + "%";
	}, 1000);
	truck = document.querySelector(".truck");
	carSwervingInterval = setInterval(function() {
		document.querySelector(".truck:not(.wheelShot)").style.left = (Math.random() * 60) + "%"; 
	}, 1500);
	carScaleInterval = setInterval(function() {
		document.querySelector(".truck:not(.wheelShot)").style.transform = "scale("+(Math.random() * .4 + .5)+")"; 
	}, 3000);	
}
// level3intervals();

function level4intervals() {

	document.querySelector("#chopper").classList = [];
	chopperHealth = 100;
	enemyShotDamage = 10;

	setTimeout(function() {
		chopperNoise.play();		
	}, 1000);
	heliceFlapInterval = setInterval(function() {
	    document.querySelectorAll(".helice").forEach(helice => {
	    	helice.classList.toggle("alter");
	    });
	}, 200);
	chopperSwervingInterval = setInterval(function() {
		document.querySelector("#chopper").style.left = (Math.random() * 60) + "%"; 
		document.querySelector("#chopper").style.top = (Math.random() * 80 - 15) + "%"; 
	}, 2500);
	chopperScaleInterval = setInterval(function() {
		var heliScale = (Math.random() * .4 + .1);
		chopperNoise.volume = heliScale;
		document.querySelector("#chopper").style.transform = "scale("+heliScale+") rotate("+(Math.random() * 40 - Math.random() * 40)+"deg)"; 
	}, 3000);	
}
// level4intervals();



function clearLevel3intervals() {
	if(roadMovingInterval) clearInterval(roadMovingInterval);
	if(carSwervingInterval) clearInterval(carSwervingInterval);
	if(carScaleInterval) clearInterval(carScaleInterval);
	if(carShakeInterval) clearInterval(carShakeInterval);
}


function clearLevel4intervals() {
	if(heliceFlapInterval) clearInterval(heliceFlapInterval);
	if(chopperSwervingInterval) clearInterval(chopperSwervingInterval);
	if(chopperScaleInterval) clearInterval(chopperScaleInterval);
	if(enemyShotsTimeout) clearTimeout(enemyShotsTimeout);
}


function shootWheel(wheel) {

	clearInterval(carScaleInterval);

	carShakeInterval = setInterval(function() {
		if(document.querySelector(".truck.wheelShot")) {
			flatTire.play();
			document.querySelector(".truck.wheelShot").classList.toggle("up"); 
		}
	}, 200);	
	
	if(truck.classList.contains("wheelShot")) {
		crash.play();
		flatTire.pause();
		setTimeout(function() {
			truck.classList.remove("wheelShot");
			truck.classList.add("broken");
			document.querySelectorAll(".truck .enemy").forEach(enemy => {
				enemy.classList.add("dead");
				assessVictory();
			});
		}, 1000);
	} else {
		truck.classList.add("wheelShot", wheel);
	}

}

// LEVEL 4
var chopperHealth = 100;
function shootChopper(score) {
	chopperHealth -= score;

	if(chopperHealth < 1) {
		clearLevel4intervals();
		setTimeout(function() {
			document.querySelector("#chopper").style = [];
			document.querySelector("#chopper").classList.add("crashing");

			document.querySelectorAll("#chopper .enemy").forEach(enemy => {
				enemy.classList.add("dead");
			});

			setTimeout(function() {
				crash.play();
				document.querySelector("#level4").classList.add("explosion");
				setTimeout(function() {
					document.querySelector("#level4").classList.remove("explosion");
					setTimeout(function() {
						assessVictory();
					}, 100);
				}, 800);		
			}, 1000);
		}, 1000);
	}

}


// LEVEL 5

function level5intervals() {
	roadMovingInterval5 = setInterval(function() {
		innerRoad = document.querySelector("#level5 .obstacle.road .inner");
		var roadPosition = (parseInt(innerRoad.style.backgroundPositionX) - 1000);
		innerRoad.style.backgroundPositionX = roadPosition + "px";
	}, 1000);
}

