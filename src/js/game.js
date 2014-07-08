(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.pipes = null;
    this.force = 0;
    this.gravity = 0.6;
    this.accel = 0;
  }

  Game.prototype = {

    create: function () {
      var x = this.game.width / 2
        , y = this.game.height / 2;

      this.game.physics.startSystem(Phaser.Physics.Arcade);
      this.game.physics.arcade.setBoundsToWorld();
      console.log('bounds', this.game.physics);

      this.player = this.game.add.sprite(x, y, 'player');
      this.player.animations.add('walk', [0,1,2], 6, true);
      this.game.physics.arcade.enable(this.player);
      this.player.body.gravity.y = 1000;
      this.player.body.allowRotation = true;

      console.log(this.player);

      this.player.animations.play('walk', 50, true);
      this.player.anchor.setTo(0.5, 0.5);

      this.pipes = this.game.add.group();
      this.pipes.createMultiple(20, 'pipe');
      console.log('pipes:', this.pipes);

      console.log(this.input);
      this.input.onUp.add(this.onInputUp, this);

      this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);
    },

    update: function () {
      this.player.body.angularVelocity = this.player.body.velocity.y / 2;
    },

    render: function(){
      this.game.debug.body(this.player);
    },

    onInputUp: function(){
      // Add a vertical velocity to the bird
      this.player.body.velocity.y = -350;
      console.log('end');
    },

    setPipeProperty: function(pipe){
      this.game.physics.arcade.enable(pipe);
      pipe.height = 60;
      pipe.body.velocity.x = -200;
      pipe.checkWorldBounds = true;
      pipe.outOfBoundsKill = true;
    },

    addPipeEnd: function(x, y, img){
      var pipe = this.game.add.sprite(x, y, img);
      console.log('addPipeEnd', pipe);
      this.setPipeProperty(pipe);
    },

    addOnePipe: function(x, y){
      var pipe = this.pipes.getFirstDead();
      pipe.reset(x, y);
      this.setPipeProperty(pipe);
      pipe.events.onOutOfBounds.add(function(){
        console.log('i am dead!');
      });
    },

    addRowOfPipes: function(){
      var hole = Math.floor(Math.random()*5)+1;

      for (var i = 0; i < 8; i++){
        var x = 400,
            y = i*60+10;

        if(i === hole+1){
          this.addPipeEnd(x, y, 'pipedown');
        }

        if(i === hole-1){
          this.addPipeEnd(x, y, 'pipeup');
        }

        if(i !== hole && i !== hole +1){
          this.addOnePipe(x, y);
        }
      }
    }
  };

  window['flaptactics'] = window['flaptactics'] || {};
  window['flaptactics'].Game = Game;

}());
