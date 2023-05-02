//oyun kontrol
var gamecanvas = document.getElementById("game");
var ctx = gamecanvas.getContext("2d");
var dpr =  1;
var rect = gamecanvas.getBoundingClientRect();
gamecanvas.width = rect.width * dpr;
gamecanvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
var game_width =gamecanvas.width;
var game_height =gamecanvas.height;
var game_over=false;
var pos_player = [game_width/2,game_height/2+300];
//oyun kontrol

//player config
var player_conf={
  player_hp:400,
  player_x:pos_player[0],
  player_y:pos_player[1],
  player_size:[80,80], 
  player_speed:7,
  player_cur_xp:0,
  player_req_xp:200,
  player_lvl_point:0,
  player_level:1,
  player_firerate:2,//max 0.3
  player_firerate_max:0.3,
  xp_increase:50,
  player_fr_level:1,
  player_bdmg_level:1,
  player_bspeed_level:1,
  player_hp_level:1,
  player_speed_level:1,
  player_wall_level:1,
}
var player = new Player(player_conf.player_hp,player_conf.player_hp,
  player_conf.player_x,player_conf.player_y,player_conf.player_size,
  player_conf.player_speed,player_conf.player_firerate,player_conf.player_cur_xp,player_conf.player_req_xp,
  player_conf.player_lvl_point,player_conf.player_level,
  player_conf.player_fr_level,player_conf.player_bdmg_level,player_conf.player_bspeed_level,player_conf.player_hp_level
  ,player_conf.player_speed_level,player_conf.player_wall_level);
//enemy config
var enemy_conf={
  enemy_lvl:1,
  enemy_hp:150,  
  enemy_y:-60, 
  enemy_size:[60,60], 
  enemy_speed:0.5,
  enemy_borntime:3000,//ms
  enemy_max_hp:1000,
  enemy_max_speed:7,
  enemy_damage:50,
  enemy_damage_max:200,
  enemy_wall_damage:30,
  enemy_wall_damage_max:125,
  enemy_castle_damage:50,
  enemy_hittingwall:false
}
//bullet config
var bullet_conf={
  bullet_size:[20,20], 
  bullet_speed:2,//max 16
  bullet_damage:50,
  bullet_damage_max:250
}
var wall_conf={
  wall_hp:1000,
  wall_size:[400,30]
}
var castle = new Castle(5000,5000,pos_player[0]-game_width/2,pos_player[1]+100,[game_width,50])
var walls=[];
var wall1 = new Wall(wall_conf.wall_hp,pos_player[0]+300,pos_player[1]-60,wall_conf.wall_size);
var wall2 = new Wall(wall_conf.wall_hp,pos_player[0]-700,pos_player[1]-60,wall_conf.wall_size);
var wall3 = new Wall(wall_conf.wall_hp,pos_player[0]-200,pos_player[1]-60,wall_conf.wall_size);
walls.push(wall1);
walls.push(wall2);
walls.push(wall3);
var imageCastle = new Image(game_width, 50);
imageCastle.src="images/castle.png";
function Castle(full_hp,hp,position_x, position_y, size){
  this.full_hp = full_hp;
  this.hp = hp;
  this.position_x = position_x;
  this.position_y = position_y;
  this.size = size;
  this.draw = function() {
    //ctx.fillStyle = "#FF0000";
    //ctx.fillRect(this.position_x, this.position_y, this.size[0], this.size[1]);
    ctx.drawImage(imageCastle,this.position_x-10,this.position_y-this.size[1]-30,this.size[0]+20,this.size[1]+100);
  }
}
var enemyImage= new Image(enemy_conf.enemy_size[0],enemy_conf.enemy_size[1]);
enemyImage.src="images/enemy.png";
function Enemy(hp, position_x, position_y, size, speed,hittingwall) {
  this.hp = hp;
  this.position_x = position_x;
  this.position_y = position_y;
  this.size = size;
  this.speed = speed;
  this.wallhittime;
  this.hittingwall=hittingwall;
  this.draw = function() {
    //ctx.fillStyle = "#FF0000";
    //ctx.fillRect(this.position_x, this.position_y, this.size[0], this.size[1]);
    ctx.drawImage(enemyImage,this.position_x, this.position_y, this.size[0]+10, this.size[1]+10);
  }
  this.walk = function(){
    this.position_y+=this.speed;
  }
  this.hitwall = function(indexwall,Enemy){
    if(Enemy!=null&&Enemy.hp>0){
      walls[indexwall].hp-=enemy_conf.enemy_wall_damage;
      Enemy.hittingwall=false;
    }
    clearTimeout(Enemy.wallhittime);
  }
}
var bulletImage= new Image(bullet_conf.bullet_size[0],bullet_conf.bullet_size[1]);
bulletImage.src="images/bullet.png";
function Bullet(position_x, position_y, size, speed,damage){
  this.position_x = position_x;
  this.position_y = position_y;
  this.size = size;
  this.speed = speed;
  this.damage = damage;
  this.draw = function() {
    //ctx.fillStyle = "#FFFF00";
    //ctx.fillRect(this.position_x, this.position_y, this.size[0], this.size[1]);
    ctx.drawImage(bulletImage,this.position_x, this.position_y, this.size[0], this.size[1]);
  }
  this.shoot = function(){
    this.position_y-=this.speed;
  }
}
var playerImage = new Image(player_conf.player_size[0], player_conf.player_size[1]);
playerImage.src="images/player.png";
function Player(full_hp,hp, position_x, position_y, size, speed,firerate,cur_xp,req_xp,lvl_point,player_level
  ,player_fr_level,player_bdmg_level,player_bspeed_level,player_hp_level,player_speed_level,player_wall_level){
  this.full_hp =full_hp;
  this.hp =hp;
  this.position_x = position_x;
  this.position_y = position_y;
  this.size = size;
  this.speed = speed;
  this.firerate = firerate;
  this.cur_xp=cur_xp;
  this.req_xp=req_xp;
  this.lvl_point=lvl_point;
  this.player_level=player_level;
  this.player_fr_level=player_fr_level;
  this.player_bdmg_level=player_bdmg_level;
  this.player_bspeed_level=player_bspeed_level;
  this.player_hp_level=player_hp_level;
  this.player_speed_level=player_speed_level;
  this.player_wall_level=player_wall_level;
  this.draw = function(){
    //ctx.fillStyle= "#0000FF";
    //ctx.fillRect(player.position_x,player.position_y,player.size[0],player.size[1]);
    ctx.drawImage(playerImage,player.position_x-5,player.position_y,player.size[0]+10,player.size[1]+10);
  }
  this.shoot=function() {
    var bullet = new Bullet(player.position_x+(player.size[0]/2-7),
    player.position_y+(player.size[1]/2),bullet_conf.bullet_size,
    bullet_conf.bullet_speed,bullet_conf.bullet_damage);
    bullet_count++;
    bullets.push(bullet);
  }
}
var wallImage = new Image(wall_conf.wall_size[0],wall_conf.wall_size[1]);
wallImage.src="images/wall1.png";
function Wall(hp, position_x, position_y, size){
  this.hp =hp;
  this.position_x = position_x;
  this.position_y = position_y;
  this.size = size;
  this.draw = function(){
    ctx.fillStyle= "#FF0000";
    ctx.fillRect(this.position_x,this.position_y,this.size[0],this.size[1]);
    ctx.drawImage(wallImage,this.position_x,this.position_y,this.size[0],this.size[1]+3);
  }
}

//LEVEL HTML ITEMS
//firerate
var fr_=false;
var frButton = document.querySelector('#upgradefirerate');
frButton.addEventListener('click', function() {
  fr_=true;
  upgradeSkillsandUpdateText();
});
var frleveltxt=document.getElementById("frlvl");
var frcase =[document.getElementById("fr-1"),
document.getElementById("fr-2"),
document.getElementById("fr-3"),
document.getElementById("fr-4")];
//bulletspeed
var bdmg_=false;
var bdmgButton = document.querySelector('#upgradefiredamage');
bdmgButton.addEventListener('click', function() {
  bdmg_=true;
  upgradeSkillsandUpdateText();
});
var bdmgleveltxt=document.getElementById("bdmglvl");
var bdmgcase = [document.getElementById("bdmg-1"),
document.getElementById("bdmg-2"),
document.getElementById("bdmg-3"),
document.getElementById("bdmg-4")];
//bulletspeed
var bspeed_=false;
var bspeedButton = document.querySelector('#upgradefirespeed');
bspeedButton.addEventListener('click', function() {
  bspeed_=true;
  upgradeSkillsandUpdateText();
});
var bspeedleveltxt=document.getElementById("bspeedlvl");
var bspeedcase = [document.getElementById("bspeed-1"),
document.getElementById("bspeed-2"),
document.getElementById("bspeed-3"),
document.getElementById("bspeed-4")];
//playerhp
var hp_=false;
var hpButton = document.querySelector('#upgradeplayerhp');
hpButton.addEventListener('click', function() {
  hp_=true;
  upgradeSkillsandUpdateText();
});
var hpleveltxt=document.getElementById("hplvl");
var hpcase = [document.getElementById("hp-1"),
document.getElementById("hp-2"),
document.getElementById("hp-3")];
//playerspeed
var speed_ = false;
var speedButton = document.querySelector('#upgradeplayerspeed');
speedButton.addEventListener('click', function() {
  speed_=true;
  upgradeSkillsandUpdateText();
});
var speedleveltxt=document.getElementById("speedlvl");
var speedcase = [document.getElementById("speed-1"),
document.getElementById("speed-2"),
document.getElementById("speed-3"),
document.getElementById("speed-4")];
//walllevel
var walllevel_=false;
var wallButton = document.querySelector('#upgradewall');
wallButton.addEventListener('click', function() {
  walllevel_=true;
  upgradeSkillsandUpdateText();
});
var wallleveltxt=document.getElementById("walllvl");
var wallcase = [document.getElementById("wall-1"),
document.getElementById("wall-2"),
document.getElementById("wall-3")];
//wallrepair
wallrepair_=false;
var wallrepairButton=document.getElementById("repairwall");
wallrepairButton.addEventListener('click', function() {
  wallrepair_=true;
  upgradeSkillsandUpdateText();
});
var totalhpwall;
//LEVEL HTML ITEMS

//skilleri artirma ve text leri duzeltme
function upgradeSkillsandUpdateText(){
  if(player.lvl_point<=0){
    fr_=false;
    bdmg_=false;
    bspeed_=false;
    hp_=false;
    speed_=false;
    walllevel_=false;
    wallrepair_=false;
    return;
  }
  //silah hizi seviye artir
  if(fr_&&player.player_fr_level<4)
  {
    player.player_fr_level++;
    frleveltxt.innerText=player.player_fr_level;
    player.lvl_point--;
    player.firerate=Math.max(player.firerate/2,player_conf.player_firerate_max);
    clearInterval(player_shoot);
    player_shoot = setInterval(player.shoot,player.firerate*500);
    for (let index = 0; index < player.player_fr_level; index++) {
      frcase[index].style.backgroundColor="rgb(226, 241, 12)";
    }
    if(player.player_fr_level==4)
    {
      frleveltxt.innerText="MAX.";
      frButton.disabled=true;
    }
    fr_=false;
  }
  //mermi hasari seviye artir
  else if(bdmg_&&player.player_bdmg_level<4)
  {
    player.player_bdmg_level++;
    bdmgleveltxt.innerText=player.player_bdmg_level;
    player.lvl_point--;
    bullet_conf.bullet_damage=Math.min(bullet_conf.bullet_damage*2,bullet_conf.bullet_damage_max);
    for (let index = 0; index < player.player_bdmg_level; index++) {
      bdmgcase[index].style.backgroundColor="rgb(226, 241, 12)";
    }
    if(player.player_bdmg_level==4)
    {
      bdmgleveltxt.innerText="MAX.";
      bdmgButton.disabled=true;
    }
    bdmg_=false;
  }
  //mermi hizi seviye artir
  else if(bspeed_&&player.player_bspeed_level<4)
  {
    player.player_bspeed_level++;
    bspeedleveltxt.innerText=player.player_bspeed_level;
    player.lvl_point--;
    bullet_conf.bullet_speed=bullet_conf.bullet_speed*2;
    for (let index = 0; index < player.player_bspeed_level; index++) {
      bspeedcase[index].style.backgroundColor="rgb(226, 241, 12)";
    }
    if(player.player_bspeed_level==4)
    {
      bspeedleveltxt.innerText="MAX.";
      bspeedButton.disabled=true;
    }
    bspeed_=false;
  }
  //oyuncu cani seviye artir
  else if(hp_&&player.player_hp_level<3)
  {
    player.player_hp_level++;
    hpleveltxt.innerText=player.player_hp_level;
    player.lvl_point--;
    player.full_hp=player.full_hp*2;
    player.hp=player.full_hp;
    for (let index = 0; index < player.player_hp_level; index++) {
      hpcase[index].style.backgroundColor="rgb(226, 241, 12)";
    }
    if(player.player_hp_level==3)
    {
      hpleveltxt.innerText="MAX.";
      hpButton.disabled=true;
    }
    hp_=false;
  }
  //oyuncu hizi artir
  else if(speed_&&player.player_speed_level<4)
  {
    player.player_speed_level++;
    speedleveltxt.innerText=player.player_speed_level;
    player.lvl_point--;
    player.speed=Math.min(player.speed*2,40);
    for (let index = 0; index < player.player_speed_level; index++) {
      speedcase[index].style.backgroundColor="rgb(226, 241, 12)";
    }
    if(player.player_speed_level==4)
    {
      speedleveltxt.innerText="MAX.";
      speedButton.disabled=true;
    }
    speed_=false;
  }
  //duvar seviye artir
  else if(walllevel_&&player.player_wall_level<3)
  {
    player.player_wall_level++;
    wallleveltxt.innerText=player.player_wall_level;
    player.lvl_point--;
    for (let index = 0; index < walls.length; index++) {
      walls[index].hp=player.player_wall_level*1000;
      walls[index].size=[400,30+player.player_wall_level*3];
    }
    if(player.player_wall_level==2)
      wallImage.src="images/wall2.png";
    if(player.player_wall_level==3)
      wallImage.src="images/wall3.png";
    for (let index = 0; index < player.player_wall_level; index++) {
      wallcase[index].style.backgroundColor="rgb(226, 241, 12)";
    }
    if(player.player_wall_level==3)
    {
      wallleveltxt.innerText="MAX.";
      wallButton.disabled=true;
    }
    walllevel_=false;
  }
  //duvar tamir et
  
  else if(wallrepair_)
  {
    
    for (let index = 0; index < walls.length; index++)
    {
      totalhpwall+=walls[index].hp; 
    } 
      
    if(totalhpwall!=player.player_wall_level*1000*3)
    {
    player.lvl_point--;
    for (let index = 0; index < walls.length; index++) {
      walls[index].hp=player.player_wall_level*1000;
      walls[index].size=[400,walls[index].size[1]];
    }
    }
    wallrepair_=false;
  }
  fr_=false;
  bdmg_=false;
  bspeed_=false;
  hp_=false;
  speed_=false;
  walllevel_=false;
  wallrepair_=false;
}
//player cani text
function checkPlayerHPtext(){
  var hp_text = document.getElementById("hp");
  hp_text.innerText = player.hp;
  const red = document.querySelector(".red-area-hp");
  red.style.width = ((player.hp/player.full_hp)*100) +"%";
  const green = document.querySelector(".green-area-hp");
  green.style.width = (100 - player.hp/player.full_hp*100) + "%";
}
//player level text ve yukseltme
function checkPlayerLevel(){
  var player_lvl = document.getElementById("player_level");
  player_lvl.innerText = player.player_level;
  var r_xp = document.getElementById("rq-lvl-txt");
  r_xp.innerText=player.req_xp;
  var c_xp = document.getElementById("cr-lvl-txt");
  c_xp.innerText=player.cur_xp;
  const red = document.querySelector(".lvl-red-area");
  red.style.width = ((player.cur_xp/player.req_xp)*100) + "%";
  const back = document.querySelector(".lvl-back-area");
  back.style.width = (100-(player.cur_xp/player.req_xp)*100) +"%";
  var lvlpoints = document.getElementById("levelpoints");
  lvlpoints.innerText=player.lvl_point;
  if(player.cur_xp>=player.req_xp)
  {
    player.player_level++;
    player.lvl_point++;
    player.cur_xp=player.cur_xp-player.req_xp;
    player.req_xp = player.req_xp + player.player_level*50;
  }
}
//kale can text
function checkCastleHPtext(){
  var hp_text = document.getElementById("cs-hp");
  hp_text.innerText = castle.hp;
  const red = document.querySelector(".cs-red-area-hp");
  red.style.width = ((castle.hp/castle.full_hp)*100) +"%";
  const green = document.querySelector(".cs-green-area-hp");
  green.style.width = (100 - castle.hp/castle.full_hp*100) + "%";
}
//collision detect
function checkCollision(object1, object2) {
  if(object2==null||object1==null){
    return false;
  }
    
  if (object1.position_x < object2.position_x + object2.size[0] &&
      object1.position_x + object1.size[0] > object2.position_x &&
      object1.position_y < object2.position_y + object2.size[1] &&
      object1.size[1] + object1.position_y > object2.position_y) {
    return true; // carpisma var
  }
  return false; // carpisma yok
}
//dusman tura bagli seviye yukselme
function upgradeEnemy(){
  var enemy_lvl = parseInt(Math.floor(round/5))+1;
  if(enemy_lvl==enemy_conf.enemy_lvl)
  return;
  enemy_conf.enemy_lvl=enemy_lvl;
  enemy_conf.enemy_hp=Math.min(Math.floor(enemy_lvl*enemy_conf.enemy_hp*3/2),enemy_conf.enemy_max_hp);
  enemy_conf.enemy_speed=Math.min(enemy_lvl*enemy_conf.enemy_speed,enemy_conf.enemy_max_speed);
  enemy_conf.enemy_damage=Math.min(enemy_lvl*enemy_conf.enemy_damage,enemy_conf.enemy_damage_max);
  enemy_conf.enemy_wall_damage=Math.min(enemy_lvl*enemy_conf.enemy_wall_damage,enemy_conf.enemy_wall_damage_max);
  //guncelle xp yukselisi
  player_conf.xp_increase*=enemy_lvl;
}
//dusman uretme
function createEnemy(count,enemys){
  var spawnpoint_x=[60,170,280,430,550,660,770,940,1060,1170,1280];
  var remain_enemy_place=spawnpoint_x.length;
  for (let index = 0; index < count; index++) {
      var x = Math.floor(Math.random() * remain_enemy_place);
      var enemy = new Enemy(enemy_conf.enemy_hp, spawnpoint_x[x], enemy_conf.enemy_y, enemy_conf.enemy_size,enemy_conf.enemy_speed,enemy_conf.enemy_hittingwall);
      enemys.push(enemy);
      remain_enemy_place-=1;
      spawnpoint_x.splice(x,1);
  }
  enemys_born=true;
  updateGameText();
}
//her bir saniye de bir hasar verme oyuncuya
var hitting=false;
function hitPlayer(Enemy){
  if(Enemy!=null&&Enemy.hp>0){
  player.hp=Math.max(0,player.hp-enemy_conf.enemy_damage);
  }
  hitting=false;
  checkPlayerHPtext();
  clearTimeout(playerhptimeout);
}

//Düsman ile duvar carpismasi
function checkWallandPlayer2Enemy2Enemy(){
  for (let indexenemys = 0; indexenemys < enemys.length; indexenemys++) 
  {
    enemys[indexenemys].draw();
    //dusmanin dusmanla carpismasi
    var enemy_col=false;
    for (let j = indexenemys-1; j >= 0; j--) {
      if (checkCollision(enemys[indexenemys], enemys[j])) {
        enemys[indexenemys].speed=0;
        enemy_col=true;
      }
    }
    if(enemy_col)
      continue;//carpistisya gec
    //kale ile carpisma
    if (castle.hp>0&&enemys[indexenemys].position_y>gamecanvas.height+enemys[indexenemys].size[1])
      {
        enemys.splice(indexenemys,1);
        updateGameText();
        castle.hp-=enemy_conf.enemy_castle_damage;
        checkCastleHPtext();
        if(castle.hp<=0){
          gameOver();
          gameOver=true;
        }
        continue;
      } 
    //duvar ile dusman
    var colwall=false;
    for (let indexwalls = 0; indexwalls < walls.length; indexwalls++) {
      if (walls[indexwalls].hp>0&&checkCollision(enemys[indexenemys], walls[indexwalls]) ) 
      {
        enemys[indexenemys].speed = 0;// dusmanin hizini sifirla
        if(enemys[indexenemys].hittingwall==false){
          enemys[indexenemys].hittingwall=true;
          enemys[indexenemys].wallhittime = setTimeout(enemys[indexenemys].hitwall,1000,indexwalls,enemys[indexenemys]);// wall hp dusur
        }
        
        colwall=true;
      } 
    }
    //player dusman capisinca
    if(checkCollision(player,enemys[indexenemys])&&colwall==false)
    {
        //her bir saniye de bir hasar verme
        if(hitting==false&&player.hp>0){
          playerhptimeout = setTimeout(hitPlayer,1000,enemys[indexenemys]);
          hitting=true;
        }
        enemys[indexenemys].speed = 0;
        checkPlayerHPtext();
        if(player.hp<=0&&game_over==false)
        { 
          game_over=true;
        }
    }else
    {
      //duvar ile carpısmissa
      if(colwall==false){
        enemys[indexenemys].speed=enemy_conf.enemy_speed;
      }
      enemys[indexenemys].walk();
      
    }
  }
}
//WALL can yazilari
function checkWallHP(){
  for (let indexwalls = 0; indexwalls < walls.length; indexwalls++) {
    if (walls[indexwalls].hp>0){
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText("HP: " + walls[indexwalls].hp, walls[indexwalls].position_x, walls[indexwalls].position_y +20);
    }
  }
}
//enemy hp text 
function checkEnemyHP(){
  for (let indexenemy = 0; indexenemy < enemys.length; indexenemy++) {
    if (enemys[indexenemy].hp>0){
      ctx.fillStyle = "black";
      ctx.font = "10px Arial";
      ctx.fillText("HP: " + enemys[indexenemy].hp, enemys[indexenemy].position_x+10, enemys[indexenemy].position_y -10);
    }
  }
}
//bullet cizme canvas
function drawBullet(){
  for (let index = 0; index < bullets.length; index++) {
    bullets[index].draw();
    bullets[index].shoot();
    if(bullets[index].position_y<=0){
      bullets.splice(index,1)
    }
  }
}
//bullet ve enemy carpisma 
var destroyed_enemy_count=0;
function checkBullet2Enemy(){
  for (let indexbullet = 0; indexbullet < bullets.length; indexbullet++) {
    for (let indexenemy = 0; indexenemy < enemys.length; indexenemy++) {
        if (checkCollision(bullets[indexbullet],enemys[indexenemy])) {
          enemys[indexenemy].hp-=bullets[indexbullet].damage;
          bullets.splice(indexbullet,1)
          if (enemys[indexenemy].hp<=0) {
            destroyed_enemy_count++;
            player.cur_xp+=player_conf.xp_increase;
            checkPlayerLevel();
            enemys.splice(indexenemy,1)
            updateGameText();
          }
        }
    }
  }
}
//wall cizme canvas
function drawWall(){
  for (let indexwalls = 0; indexwalls < walls.length; indexwalls++) 
  {
    if(walls[indexwalls].hp>0)
    {
      walls[indexwalls].draw();
    }
  }
}
function drawCross(){
  for (let y = player.position_y-10; y >= 0; y -= 50) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle= "#0000FF";
    ctx.fillRect(player.position_x+player.size[0]/2,y,5,5);
    ctx.globalAlpha = 1;
  }
}
//round basi text duzeltme
function updateGameText(){
  if(enemys_remain==0&&enemys.length==0)
  {
    configureNextRound();
  }
  var round_text = document.getElementById("round");
  round_text.innerText=round;
  var rem_enemy_text = document.getElementById("remain_enemy");
  rem_enemy_text.innerText=enemys_remain; 
  var round_enemy_text = document.getElementById("round_enemy");
  round_enemy_text.innerText=round_enemies;
  
}

//mobil hareket komutlari
var container = document.getElementById("game");
var touchStartX;
var touchStartY;
var isDragging = false;

container.addEventListener("touchstart", function(event) {
			isDragging = false;
			if (event.touches.length !== 1) {
				return;
			}
			event.preventDefault();
			var touch = event.touches[0];
			touchStartX = touch.clientX;
			touchStartY = touch.clientY;
			window.navigator.vibrate(50);
      if (touchStartX < window.innerWidth / 2) {
				if(player.position_x>0+10)
        player.position_x -= player.speed; 
			} else {
        if(player.position_x<game_width-player.size[0]-10)
        player.position_x += player.speed; 
			}
		});

container.addEventListener("touchmove", function(event) {
			if (event.touches.length !== 1) {
				return;
			}
			event.preventDefault();
			var touch = event.touches[0];
			var touchEndX = touch.clientX;
			isDragging = true;
			if (touchEndX < window.innerWidth / 2) {
				if(player.position_x>0+10)
        player.position_x -= player.speed; 
			} else {
        if(player.position_x<game_width-player.size[0]-10)
        player.position_x += player.speed; 
			}
		});


//hareket komutlari
document.addEventListener("keydown", function (event) {
  if (event.key == "a"||event.key == "A"||event.keyCode === 37) {
      //pencere kenari kontrol
      if(player.position_x>0+10)
        player.position_x -= player.speed; // "a" tusuna sol
  } else if (event.key == "d"||event.key == "D"||event.keyCode === 39) {
      //pencere kenari kontrol
      if(player.position_x<game_width-player.size[0]-10)
        player.position_x += player.speed; // "d" tusuna sag
  }
});
//oyun bitti
function gameOver(){
  if((player.hp<=0||castle.hp<=0)&&game_over==false)
    { 
          game_over=true;
    }
}
//round ilerlemesi
function configureNextRound(){
  round++;
  enemys_remain = round*2+2;
  round_enemies = round*2+2;
  click=false;
  roundButton.disabled = false;
  updateGameText();
}
var timeEnemy;//dogma time
var round=1;
var enemys_remain = round*2+2;
var round_enemies = round*2+2;
var enemy_created=0;
var enemys_born=true;//dusman dogabilir
var enemys=[];

//round controller
function gameController(){
  if(enemys_born&&enemys_remain>0)
  {
    enemys_born=false;
    var maxborn = Math.min(enemys_remain,10);
    var born = Math.max(Math.floor(Math.random() * maxborn),1);
    enemy_created+=born;
    enemys_remain=enemys_remain-born;
    timeEnemy = setTimeout(createEnemy,enemy_conf.enemy_borntime,born,enemys); 
  }
}

//round baslatma
var click =false;
var roundButton = document.querySelector('#roundstart');
roundButton.addEventListener('click', function() {
  upgradeEnemy();
  roundButton.disabled = true;
  click=true;
  if(game_over)
    location.reload(true);
});


//oyun akisi
function gameLoop(){
  if(game_over){
    clearInterval(player_shoot);
    ctx.fillStyle = "#ccc";
    ctx.fillRect(game_width/4-100,game_height/4-100,1000,500 );
    ctx.fillStyle = "#838579";
    ctx.font = "100px Verdana";
    ctx.fillText("KAYBETTİNİZ D:",game_width/4,game_height/4  );
    ctx.font = "25px Verdana";
    ctx.fillText("Doğan Düşman Sayısı: "+ enemy_created,game_width/4,game_height/4+100);
    ctx.fillText("Atılan Mermi Sayısı: "+ bullet_count,game_width/4,game_height/4+125);
    ctx.fillText("Öldürülen Düşman Sayısı: "+ destroyed_enemy_count,game_width/4,game_height/4+150);
    ctx.fillText("Ulaşılan TUR: "+ round,game_width/4,game_height/4+175);
    ctx.fillText("Ulaşılan Level: "+ round,game_width/4,game_height/4+200);
    ctx.fillText("Sağ alttan oyunu tekrar başlatabilirsiniz.",game_width/4,game_height/4+300);
    roundButton.disabled = false;
    roundButton.innerText="YENİDEN BAŞLA";
  }else{
    gameOver();
    ctx.clearRect(0, 0, game_width, game_height); 
    player.draw();
    castle.draw();
    
    checkBullet2Enemy();  
    if(click){
      gameController();//round baslatma tusuna tiklanirsa
    }
    drawWall();
    checkWallandPlayer2Enemy2Enemy();
    checkPlayerHPtext();
    checkCastleHPtext();
    checkPlayerLevel();
    checkWallHP();
    checkEnemyHP();
    drawBullet();
    drawCross();
    if(tutorialOn)drawTutorial();
    requestAnimationFrame(gameLoop);
  }
  
}
function drawTutorial(){
  ctx.fillStyle = "black";
  ctx.fillRect(game_width-32, game_height-57, 23, 23);
  ctx.fillRect(game_width-32, game_height-30, 23, 23);
  ctx.fillRect(28,gamecanvas.height-57, 23, 23);
  ctx.fillRect(28,gamecanvas.height-30, 23, 23);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillRect(29,gamecanvas.height-56, 20, 20);
  ctx.fillRect(29,gamecanvas.height-29, 20, 20);
  ctx.fillRect(game_width-31, game_height-56, 20, 20);
  ctx.fillRect(game_width-31, game_height-29, 20, 20);
  ctx.fillStyle = "black";
  ctx.fillText("A" ,30,gamecanvas.height-40);
  ctx.fillText("←" ,30,gamecanvas.height-15);
  ctx.fillText("D" ,game_width-30,game_height-40);
  ctx.fillText("→" ,game_width-30,game_height-15);
  
}
var tutorialOn=true;
function tutorialOff(){
  tutorialOn=false;
}
//tanimlama
var playerhptimeout;
var player_shoot = setInterval(player.shoot,player.firerate*500);
var tutorialtimeout = setTimeout(tutorialOff,8000);
var bullet_count = 1;
var bullets=[];
updateGameText();
checkPlayerHPtext();
checkCastleHPtext();
gameLoop();