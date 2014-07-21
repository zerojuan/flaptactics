(function() {
  'use strict';

  function Game() {
    this.counter = 0;
    this.player = null;
    this.loJumpBtn = null;
    this.midJumpBtn = null;
    this.hiJumpBtn = null;
    this.passBtn = null;
    this.pipes = null;
    this.pipesUp = null;
    this.pipesDown = null;
    this.rectangles = null;
    this.land = null;
    this.sky = null;
    this.subtotal = 0;
    this.score = null;
    this.highScore = null;
    this.newBest = null;
    this.medal = null;
    this.scoreboard = null;
    this.replay = null;
    this.force = 0;
    this.gravity = 0.6;
    this.accel = 0;
    this.killed = false;
    this.isPaused = false;
    this.storedVelocity = 0;
    localStorage.setItem('highScore', '0');
  }

  Game.prototype = {

    create: function () {
      var x = this.game.width / 2
        , y = this.game.height / 2;

      this.subtotal = 0;
      this.game.stage.backgroundColor = '#4EC0CA';

      // enable physics for game
      this.game.physics.startSystem(Phaser.Physics.Arcade);
      this.game.physics.arcade.setBoundsToWorld();

      // sky
      this.sky = this.game.add.group();
      this.sky.createMultiple(3, 'sky', 0, true);
      this.moveSky();

      // land
      this.land = this.game.add.group();
      this.land.createMultiple(3, 'land', 0, true);
      this.moveLand();

      // pipes
      this.pipes = this.game.add.group();
      this.pipes.createMultiple(20, 'pipe');
      this.pipesUp = this.game.add.group();
      this.pipesUp.createMultiple(20, 'pipeup');
      this.pipesDown = this.game.add.group();
      this.pipesDown.createMultiple(20, 'pipedown');

      // points
      this.rectangles = this.game.add.group();
      var bmd = this.game.add.bitmapData(1,1); // create a new bitmap data object
      bmd.ctx.beginPath(); // draw to the canvas context
      this.rectangles.createMultiple(5, bmd);

      // player
      this.player = this.game.add.sprite(x, y, 'player');
      this.player.animations.add('walk', [0,1,2], 6, true);
      this.player.animations.play('walk', 50, true);
      this.player.anchor.setTo(0.5, 0.5);
      this.game.physics.arcade.enable(this.player);
      // this.player.body.gravity.y = 1000;
      this.player.body.setSize(1, 20, 0, 0);
      this.player.body.allowRotation = true;
      this.player.checkWorldBounds = true;
      this.player.outOfBoundsKill = true;

      this.displayButtons();

      // events
      this.player.events.onOutOfBounds.add(this.collisionHandler, this);
      // this.input.onUp.add(this.onInputUp, this);
      this.timer = this.game.time.create(false);
      this.timer.loop(1500, this.addRowOfPipes, this);
      this.timer.start();
      // this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);
      this.pauseGame();
    },

    update: function () {
      if(this.isPaused){
        return;
      }

      if(this.counter < 50){
        this.game.physics.arcade.collide(this.pipes, this.player, this.collisionHandler, null, this);
        this.game.physics.arcade.collide(this.land, this.player, this.collisionHandler, null, this);
        this.game.physics.arcade.overlap(this.rectangles, this.player, this.scorer, null, this);
        this.timer.resume();
      }else{
        this.pauseGame();
        this.isPaused = true;
        this.counter = 0;

        if(!this.killed){
          this.reviveButtons();
        }
      }

      this.counter++;
    },

    restart: function(){
      this.game.state.start('game');
      this.killed = false;
    },

    render: function(){
      this.game.debug.body(this.player);
      this.rectangles.forEach(function(rect){
        this.game.debug.spriteBounds(rect);
      }, this);
    },

    onInputUp: function(){
      // Add a vertical velocity to the bird
      if(!this.killed){
        console.log(this.killed);
        this.player.body.velocity.y = -350;
      }
    },

    onVelocity: function(obj){
      obj.body.velocity.x = -200;
    },

    offVelocity: function(obj){
      obj.body.velocity.x = 0;
    },

    displayButtons: function(){
      var btnY = this.game.height - 50,
          btnWidth = 100,
          btnTextTint = 0x666666,
          btnTextSize = 12,
          btnTextX = 10,
          btnTextY = 10,
          loJump = null,
          midJump = null,
          hiJump = null,
          pass = null;

      // jump buttons
      this.loJumpBtn = this.game.add.button(this.game.width - 600, btnY, 'button', this.jumpAction('lo'), this);
      this.loJumpBtn.inputEnabled = true;
      this.loJumpBtn.width = btnWidth;
      loJump = this.add.bitmapText(btnTextX, btnTextY, 'minecraftia', 'lo-jump', btnTextSize);
      loJump.tint = btnTextTint;
      this.loJumpBtn.addChild(loJump);

      this.midJumpBtn = this.game.add.button(this.game.width - 450, btnY, 'button', this.jumpAction('mid'), this);
      this.midJumpBtn.inputEnabled = true;
      this.midJumpBtn.width = btnWidth;
      midJump = this.add.bitmapText(btnTextX - 5, btnTextY, 'minecraftia', 'mid-jump', btnTextSize);
      midJump.tint = btnTextTint;
      this.midJumpBtn.addChild(midJump);

      this.hiJumpBtn = this.game.add.button(this.game.width - 300, btnY, 'button', this.jumpAction('hi'), this);
      this.hiJumpBtn.inputEnabled = true;
      this.hiJumpBtn.width = btnWidth;
      hiJump = this.add.bitmapText(btnTextX, btnTextY, 'minecraftia', 'hi-jump', btnTextSize);
      hiJump.tint = btnTextTint;
      this.hiJumpBtn.addChild(hiJump);

      // pass button
      this.passBtn = this.game.add.button(this.game.width - 150, btnY, 'button', this.passAction, this);
      this.passBtn.inputEnabled = true;
      this.passBtn.width = btnWidth;
      pass = this.add.bitmapText(btnTextX + 10, btnTextY, 'minecraftia', 'pass', btnTextSize);
      pass.tint = btnTextTint;
      this.passBtn.addChild(pass);
    },

    pauseGame: function(){
      this.storedVelocity = this.player.body.velocity.y;
      this.player.body.gravity.y = 0;
      this.player.body.velocity.y = 0;
      this.player.body.angularVelocity = 0;
      this.player.animations.paused = true;

      this.sky.forEach(function(cloud){
        cloud.body.velocity.x = 0;
      });
      this.land.forEach(function(lot){
        lot.body.velocity.x = 0;
      });

      if(!this.killed){
        this.pipes.forEachAlive(this.offVelocity, this);
        this.pipesUp.forEachAlive(this.offVelocity, this);
        this.pipesDown.forEachAlive(this.offVelocity, this);
        this.rectangles.forEachAlive(this.offVelocity, this);
      }

      this.timer.pause();
    },

    unpauseGame: function(){
      console.log('gravity:', this.player.body.gravity.y, 'velocity', this.player.body.velocity.y, this.player.body.y);
      this.isPaused = false;
      this.player.animations.paused = false;
      // this.player.body.angularVelocity = this.player.body.velocity.y / 2;

      this.sky.forEach(function(cloud){
        cloud.body.velocity.x = -100;
      });
      this.land.forEach(function(lot){
        lot.body.velocity.x = -150;
      });

      this.pipes.forEachAlive(this.onVelocity, this);
      this.pipesUp.forEachAlive(this.onVelocity, this);
      this.pipesDown.forEachAlive(this.onVelocity, this);
      this.rectangles.forEachAlive(this.onVelocity, this);
      if(this.timer){
        this.timer.resume();
      }
      if(this.loJumpBtn && this.midJumpBtn && this.hiJumpBtn){
        this.killButtons();
      }
    },

    jumpAction: function(altitude){
      var that = this;
      return function(){
        console.log('jumpAction??', altitude);
        switch(altitude){
          case 'lo':
          console.log('Here');
            that.player.body.velocity.y = -150;
            break;
          case 'mid':
            that.player.body.velocity.y = -250;
            break;
          default:
            that.player.body.velocity.y = -350;
            break;
        };

        that.player.body.gravity.y = 700;
        that.unpauseGame();
      };

    },

    passAction: function(){
      console.log('passAction');
      this.player.body.velocity.y = this.storedVelocity;
      this.player.body.gravity.y = 700;
      this.unpauseGame();
    },

    moveSky: function(){
      this.sky.forEach(function(cloud ){
        cloud.reset(0, this.game.height / 3);
        var i = this.sky.getIndex(cloud);
        if(i > 0){
          cloud.reset(this.game.width, this.game.height / 3);
        }

        this.game.physics.arcade.enable(cloud);
        cloud.height = this.game.height - 250;
        cloud.width = this.game.width;
        cloud.body.velocity.x = -100;
        cloud.checkWorldBounds = true;

        var that = this;
        cloud.events.onOutOfBounds.add(function(c){
          var nextIndex = that.sky.getIndex(c) + 1;
          if(nextIndex >= 3){
            nextIndex = 0;
          }
          var next = that.sky.getAt(nextIndex);
          c.reset(next.x + next.width, that.game.height / 3);
          c.body.velocity.x = -100;
        });
      }, this);
    },

    moveLand: function(){
      this.land.forEach(function(lot){
        lot.reset(0, this.game.height - 100);
        if(this.land.getIndex(lot) > 0){
          lot.reset(this.game.width, this.game.height - 100);
        }

        this.game.physics.arcade.enable(lot);
        lot.width = this.game.width;
        lot.body.velocity.x = -150;
        lot.body.immovable = true;
        lot.checkWorldBounds = true;

        var that = this;
        lot.events.onOutOfBounds.add(function(l){
          var nextIndex = that.land.getIndex(l) + 1;
          if(nextIndex >= 3){
            nextIndex = 0;
          }
          var next = that.land.getAt(nextIndex);
          l.reset(next.x + next.width, that.game.height - 100);
          l.body.velocity.x = -150;
        });
      }, this);
    },

    killButtons: function(){
      this.loJumpBtn.kill();
      this.midJumpBtn.kill();
      this.hiJumpBtn.kill();
      this.passBtn.kill();
    },

    reviveButtons: function(){
      this.loJumpBtn.revive();
      this.midJumpBtn.revive();
      this.hiJumpBtn.revive();
      this.passBtn.revive();
    },

    setPipeProperty: function(pipe){
      this.game.physics.arcade.enable(pipe);
      pipe.height = 60;
      pipe.body.velocity.x = -200;
      pipe.body.immovable = true;
      pipe.checkWorldBounds = true;
      pipe.outOfBoundsKill = true;
    },

    addPipeEnd: function(x, y, obj){
      // var pipe = this.game.add.sprite(x, y, img);
      var pipe = this[obj].getFirstDead();
      pipe.reset(x, y);
      this.setPipeProperty(pipe);
      pipe.events.onOutOfBounds.add(function(){});
      pipe.height = 26;
    },

    addOnePipe: function(x, y){
      var pipe = this.pipes.getFirstDead();
      pipe.reset(x, y);
      this.setPipeProperty(pipe);
      pipe.events.onOutOfBounds.add(function(){
        // console.log('i am dead!');
      });
    },

    addPointPipe: function(x, y){
      var pipe = this.rectangles.getFirstDead();
      pipe.reset(x, y);
      this.setPipeProperty(pipe);
      pipe.height = 150;
      pipe.width = 1;
      pipe.events.onOutOfBounds.add(function(){});
    },

    addRowOfPipes: function(){
      var hole = Math.floor(Math.random()*4)+1;

      for (var i = 0; i < 8; i++){
        var x = this.game.width - 60,
            y = i*60;

        if(i === hole+1){
          this.addPipeEnd(x, y + 60, 'pipesDown');
        }

        if(i === hole-1){
          // add collision for point
          this.addPointPipe(x + 60, y + 50);
          this.addPipeEnd(x, y + 35, 'pipesUp');
        }

        if(i !== hole && i !== hole +1){
          this.addOnePipe(x, y);
        }
      }
    },

    collisionHandler: function(){
      if(this.killed){
        return;
      }

      this.killed = true;
      this.game.time.events.remove(this.timer);
      //kill pipes
      // this.pipes.setAll('body.velocity.x', 0, true);
      // this.pipesUp.setAll('body.velocity.x', 0, true);
      // this.pipesDown.setAll('body.velocity.x', 0, true);
      // this.rectangles.setAll('body.velocity.x', 0, true);

      this.killButtons();
      this.scoreboard = this.game.add.sprite(this.game.width / 3, this.game.height / 6, 'scoreboard');

      this.score = this.game.add.group();
      this.displayScore();
      this.highScore = this.game.add.group();
      this.displayHighScore();
      this.displayMedal();
      this.replay = this.game.add.sprite(this.game.width / 1.9, this.game.height - 200, 'replay');
      this.replay.inputEnabled = true;
      this.replay.events.onInputDown.add(this.restart, this);

      console.log('killed');
    },

    scorer: function(obj1, obj2){
      if(Phaser.Rectangle.intersects(obj1.getBounds(), obj2.getBounds())){
        console.log('intersects!!!!!!!!!');
        this.subtotal++;
      }
      // console.log('score?', this.subtotal);
    },

    displayScore: function(){
      var splits = this.subtotal.toString().split(''),
          divideX = 1.50,
          divideY = 2.6;

      // console.log('subtotal', this.subtotal, 'splits', splits);
      for(var i = splits.length - 1; i > -1; i--){
        divideX = divideX + 0.05;
        // console.log(divideX, divideY, splits[i]);
        this.score.create(this.game.width / divideX, this.game.height / divideY, splits[i]);
      }
    },

    displayHighScore: function(){
      var best = localStorage.getItem('highScore');
      // console.log('best:', best);

      if(parseInt(best) < this.subtotal){
        localStorage.setItem('highScore', this.subtotal.toString());
        best = this.subtotal.toString();
        this.newBest = this.add.bitmapText(this.game.width / 1.8, this.game.height / 2.35, 'minecraftia', 'new', 13);
        this.newBest.tint =  0xFF0000;
      }

      var splits = best.split(''),
          divideX = 1.50,
          divideY = 2.1;

      // console.log('after if', best, typeof(best), splits);
      for(var i = splits.length - 1; i > -1; i--){
        divideX = divideX + 0.05;
        this.highScore.create(this.game.width / divideX, this.game.height / divideY, best[i]);
      }
    },

    displayMedal: function(){
      var x = this.game.width / 2.6,
          y = this.game.height / 2.5;

      switch(true){
        case this.subtotal < 50:
          // console.log('bronze', this.subtotal);
          this.medal = this.game.add.sprite(x, y, 'bronze');
          break;
        case this.subtotal < 150:
          // console.log('silver', this.subtotal);
          this.medal = this.game.add.sprite(x, y, 'silver');
          break;
        case this.subtotal > 149:
          // console.log('gold', this.subtotal);
          this.medal = this.game.add.sprite(x, y, 'gold');
          break;
        default:
          this.medal = this.game.add.sprite(x, y, 'bronze');
          break;
      }
    }
  };

  window['flaptactics'] = window['flaptactics'] || {};
  window['flaptactics'].Game = Game;

}());
