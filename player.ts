/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>

class Player {
    SPEED = 0.1;
    JUMP_SPEED = 0.8;
    CLIMB_SPEED = 4;

    isJumping:boolean = false;
    isClimbing:boolean = false;
    rigidSprite:RigidSprite = null;

    standTextureFile:string = "assets/player/stand.png";
    walkTextureFile:string = "assets/player/walk.png";
    jumpTextureFile:string = "assets/player/jump.png";
    frameDimensions:number[] = [256, 256];
    animationFrame:number = 0;

    constructor (game:GameObject, position:number[])
    {
        // build the player sprite
        var playerParams:any = {
            x: position[0],
            y: position[1],
            width: 64,
            height: 64,
            color: [0.0, 1.0, 1.0, 1.0]
        };
        var playerSprite:Draw2DSprite = Draw2DSprite.create(playerParams);
        var playerVertices:number[][] = game.physicsDevice.createRectangleVertices(-playerParams.width/2, -playerParams.height/2, playerParams.width/2, playerParams.height/2);

        var playerShape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: playerVertices,
            group: 1,
            mask: 13
        });
        var playerBody:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type: 'dynamic',
            shapes: [playerShape],
            mass: 4,
            linearDrag: 0.001
        });
        var playerRigidSprite:RigidSprite = new RigidSprite({
            sprite:playerSprite,
            initialPos:[0, 0],
            body:playerBody
        });
        // next we build a player, including the rigid body, sprite, and managing object
        // import an image to use as the player display and when loading is done set it as the player's texture
        var layerTexture = graphicsDevice.createTexture({
            src: this.standTextureFile,
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.setTexture(texture);
                    this.setTextureRectangle([0, 0, this.frameDimensions[0], this.frameDimensions[1]])
                }
            }
        });

        this.rigidSprite = playerRigidSprite;
        this.rigidSprite.body.setPosition(position); // should be added to rigidSprite...

        game.physicsWorld.addRigidBody(playerBody);

        // mark the shape as a player
        this.rigidSprite.body.shapes[0].userData = {type: "player", playerObject:this};

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

    goUp()
    {
        if (!this.isJumping)
        {
            this.isJumping = true;
            var vel:number[] = this.rigidSprite.body.getVelocity();
            this.rigidSprite.body.setVelocity([vel[0], -1*this.JUMP_SPEED]);
        }
    }

    climbUp()
    {
        var pos:number[] = this.rigidSprite.body.getPosition();
        console.log("climbing...");
        this.rigidSprite.body.setPosition([pos[0], pos[1]-this.CLIMB_SPEED]);
    }

    update()
    {
        // force the player to not fall due to gravity if they are climbing
        if (this.isClimbing)
        {
            var vel:number[] = this.rigidSprite.body.getVelocity();
            this.rigidSprite.body.setVelocity([vel[0], 0]);
        }
    }

    // draws the player's sprite to the screen
    draw(draw2D:Draw2D, offset:number[])
    {
        this.rigidSprite.draw(draw2D, offset);
    }
}