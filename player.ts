/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>

class Player {
    SPEED = 0.1;
    JUMP_SPEED = 0.4;

    isJumping:boolean = false;
    rigidSprite:RigidSprite = null;

    constructor (game:GameObject, position:number[], textureFile:string)
    {
        // build the player sprite
        var playerParams:any = {
            x: position[0],
            y: position[1],
            width: 21,
            height: 21,
            color: [0.0, 1.0, 1.0, 1.0]
        };
        var playerSprite:Draw2DSprite = Draw2DSprite.create(playerParams);
        var playerVertices:number[][] = game.physicsDevice.createRectangleVertices(-playerParams.width/2, -playerParams.height/2, playerParams.width/2, playerParams.height/2);

        var playerShape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: playerVertices
        });
        var playerBody:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type: 'dynamic',
            shapes: [playerShape],
            mass: 10,
            linearDrag: 0.001
        });
        var playerRigidSprite:RigidSprite = new RigidSprite(playerSprite, [0, 0], 0, playerBody);
        // next we build a player, including the rigid body, sprite, and managing object
        // import an image to use as the player display and when loading is done set it as the player's texture
        //var layerTexture = graphicsDevice.createTexture({
        //src: "assets/player/playerProfile.png",
        //mipmaps: true,
        //onload: function (texture)
        //{
        //if (texture != null)
        //{
        //player.setTexture(texture);
        //player.setTextureRectangle([0, 0, texture.width, texture.height])
        //}
        //}
        //});

        this.rigidSprite = playerRigidSprite;
        this.rigidSprite.body.setPosition(position); // should be added to rigidSprite...

        game.physicsWorld.addRigidBody(playerBody);

        // mark the shape as a player
        this.rigidSprite.body.shapes[0].userData = {type: "player"};

        // set up jumping for the player
        this.rigidSprite.body.shapes[0].addEventListener('begin', this.checkCollision, undefined, false);
    }

    // sets the texture used to display the character. If no texture is null, displays a white box
    setTexture(texture) {
        if (this.rigidSprite.sprite != null)
        {
            this.rigidSprite.sprite.setTexture(texture);
        }
    }

    checkCollision = (arbiter, otherShape) =>
    {
        // whenever we hit another shape, set isJumping to false;
        this.isJumping = false;
    }

    // just calls into sprite
    setTextureRectangle(params)
    {
        if (this.rigidSprite.sprite != null)
        {
            this.rigidSprite.sprite.setTextureRectangle(params);
        }
    }

    getPosition(): number[] {
        return this.rigidSprite.body.getPosition();
    }

    stopWalking()
    {
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([0, vel[1]]);
    }

    walkLeft()
    {
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([-1*this.SPEED, vel[1]]);
    }

    walkRight()
    {
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([this.SPEED, vel[1]]);
    }

    jump()
    {
        if (!this.isJumping)
        {
            this.isJumping = true;
            var vel:number[] = this.rigidSprite.body.getVelocity();
            this.rigidSprite.body.setVelocity([vel[0], -1*this.JUMP_SPEED]);
        }
    }

    update()
    {

    }

    // draws the player's sprite to the screen
    draw(draw2D:Draw2D, offset:number[])
    {
        this.rigidSprite.draw(draw2D, offset);
    }
}