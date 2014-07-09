(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.pipes = null;
    this.pipesUp = null;
    this.pipesDown = null;
    this.land = null;
    this.sky = null;
    this.scoreboard = null;
    this.replay = null;
    this.force = 0;
    this.gravity = 0.6;
    this.accel = 0;
    this.killed = false;
  }

  Game.prototype = {

    create: function () {
      var x = this.game.width / 2
        , y = this.game.height / 2;
      console.log('this game:', this.game);

      this.game.stage.backgroundColor = '#4EC0CA';

      // enable physics for game
      this.game.physics.startSystem(Phaser.Physics.Arcade);
      this.game.physics.arcade.setBoundsToWorld();

      // sky
      this.sky = this.game.add.sprite(0, this.game.height / 3, 'sky');
      this.sky.width = this.game.width;
      this.sky.height = this.game.height - 250;

      // land
      this.land = this.game.add.sprite(0, this.game.height - 100, 'land');
      this.land.width = this.game.width;

      // pipes
      this.pipes = this.game.add.group();
      this.pipes.createMultiple(20, 'pipe');
      this.pipesUp = this.game.add.group();
      this.pipesUp.createMultiple(20, 'pipeup');
      this.pipesDown = this.game.add.group();
      this.pipesDown.createMultiple(20, 'pipedown');
      console.log('pipes:', this.pipes);

      // player
      this.player = this.game.add.sprite(x, y, 'player');
      this.player.animations.add('walk', [0,1,2], 6, true);
      this.game.physics.arcade.enable(this.player);
      this.player.body.gravity.y = 1000;
      this.player.body.allowRotation = true;
      this.game.physics.arcade.enable(this.player);
      this.player.checkWorldBounds = true;
      this.player.outOfBoundsKill = true;

      this.player.animations.play('walk', 50, true);
      this.player.anchor.setTo(0.5, 0.5);

      console.log(this.player);
      console.log(this.input);

      // events
      this.player.events.onOutOfBounds.add(this.collisionHandler, this);
      this.input.onUp.add(this.onInputUp, this);
      this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);
    },

    update: function () {
      this.player.body.angularVelocity = this.player.body.velocity.y / 2;
      this.game.physics.arcade.collide(this.pipes, this.player, this.collisionHandler, null, this);
    },

    restart: function(){
      this.game.state.start('game');
      this.killed = false;
    },

    render: function(){
      this.game.debug.body(this.player);
    },

    onInputUp: function(){
      // Add a vertical velocity to the bird
      if(!this.killed){
        console.log(this.killed);
        this.player.body.velocity.y = -350;
      }
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

    addRowOfPipes: function(){
      var hole = Math.floor(Math.random()*5)+1;

      for (var i = 0; i < 8; i++){
        var x = this.game.width,
            y = i*60;

        if(i === hole+1){
          this.addPipeEnd(x, y + 60, 'pipesDown');
        }

        if(i === hole-1){
          this.addPipeEnd(x, y + 35, 'pipesUp');
        }

        if(i !== hole && i !== hole +1){
          this.addOnePipe(x, y);
        }
      }
    },

    collisionHandler: function(){
      this.killed = true;
      this.game.time.events.remove(this.timer);
      //kill pipes
      this.pipes.setAll('body.velocity.x', 0, true);
      this.pipesUp.setAll('body.velocity.x', 0, true);
      this.pipesDown.setAll('body.velocity.x', 0, true);

      this.scoreboard = this.game.add.sprite(this.game.width / 3, 0, 'scoreboard');
      this.replay = this.game.add.sprite(this.game.width / 3, this.game.height / 2, 'replay');
      this.replay.inputEnabled = true;
      this.replay.events.onInputDown.add(this.restart, this);
      console.log(this.player);
      console.log('killed');
    }
  };

  window['flaptactics'] = window['flaptactics'] || {};
  window['flaptactics'].Game = Game;

}());
