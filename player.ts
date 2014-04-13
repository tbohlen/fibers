/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>

enum Direction {
    LEFT,
    RIGHT
}

class Player {
    SPEED = 0.1;
    JUMP_SPEED = 0.8;
    CLIMB_SPEED = 4;
    THRESHOLD_STANDING_SPEEN = 0.01;

    isJumping:boolean = true; // starts as true so that you can't jump before ever hitting the ground
    canClimb:boolean = false;
    isClimbing:boolean = false;
    climbableObject:Climbable = null;
    canBuild:boolean = false;
    rigidSprite:RigidSprite = null;

    facing:Direction = Direction.RIGHT;

    standTextureFile:string = "assets/player/stand.png";
    walkTextureFile:string = "assets/player/walk.png";
    jumpTextureFile:string = "assets/player/jump.png";

    standTexture:Texture = null;
    walkTexture:Texture = null;
    jumpTexture:Texture = null;

    frameDimensions:number[] = [256, 256];
    animationFrame:number = 0;

    keys:any;
    collisionUtil:Physics2DCollisionUtils;

    loadTextures(graphicsDevice:GraphicsDevice)
    {
        // import an image to use as the player display and when loading is done set it as the player's texture
        graphicsDevice.createTexture({
            src: this.standTextureFile,
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.standTexture = texture;
                    this.setTexture(texture);
                    this.setTextureRectangle([0, 0, this.frameDimensions[0], this.frameDimensions[1]]);
                }
            }
        });
        graphicsDevice.createTexture({
            src: this.walkTextureFile,
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.walkTexture = texture;
                }
            }
        });
        graphicsDevice.createTexture({
            src: this.jumpTextureFile,
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.jumpTexture = texture;
                }
            }
        });
    }

    constructor (game:GameObject, position:number[])
    {
        this.keys = game.keys;
        this.collisionUtil = game.collisionUtil;
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
        this.loadTextures(game.graphicsDevice);

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

    // checks all collisions
    // TODO: combine this and the next function in some nice way
    checkCollision = (arbiter, otherShape) =>
    {
        // whenever we hit another shape, set isJumping to false;
        var vel:number[] = this.rigidSprite.body.getVelocity();
        var magnitude = Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1]);
        if (magnitude < this.THRESHOLD_STANDING_SPEEN) {
            this.isJumping = false;
        }
    }

    // only checks collisions with interactables
    collisionCallback(otherObject):void
    {
        // check for climbable and if climbable, set canClimb and save the object
        if (otherObject.hasOwnProperty("isClimbable") && otherObject.isClimbable) {
            this.climbableObject = <Climbable>otherObject;
            this.canClimb = this.climbableObject.isClimbableAtObjectPosition(this.collisionUtil, this.getPosition());
        }
        // check for buildable and set canBuild
        if (otherObject.hasOwnProperty("isBuildable") && otherObject.isBuildable) {
            this.canBuild = true;
        }
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

    goRight()
    {
        if (this.isClimbing) {
            this.climbRight();
        }
        else {
            this.walkRight();
        }
    }

    goLeft()
    {
        if (this.isClimbing) {
            this.climbLeft();
        }
        else {
            this.walkLeft();
        }
    }

    climbLeft()
    {
        var pos:number[] = this.rigidSprite.body.getPosition();
        console.log("climbing left");
        // XXX: this is dangerous teleportation! Could break physics engine
        this.rigidSprite.body.setPosition([pos[0] - this.CLIMB_SPEED, pos[1]]);
    }

    climbRight()
    {
        var pos:number[] = this.rigidSprite.body.getPosition();
        console.log("climbing right");
        // XXX: this is dangerous teleportation! Could break physics engine
        this.rigidSprite.body.setPosition([pos[0] + this.CLIMB_SPEED, pos[1]]);
    }

    walkLeft()
    {
        console.log("walking left");
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([-1*this.SPEED, vel[1]]);
        this.facing = Direction.LEFT;
    }

    walkRight()
    {
        console.log("walking right");
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([this.SPEED, vel[1]]);
        this.facing = Direction.RIGHT;
    }

    goUp()
    {
        if (this.canClimb)
        {
            // if the player can climb and they press up, move them up and set isClimbing
            this.climbUp();
        }
        else if (!this.isJumping)
        {
            this.jumpUp();
        }
    }

    jumpUp()
    {
        this.isJumping = true;
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([vel[0], -1*this.JUMP_SPEED]);
    }

    climbUp()
    {
        this.isClimbing = true;
        var pos:number[] = this.rigidSprite.body.getPosition();
        console.log("climbing up");
        // XXX: this is dangerous teleportation! Could break physics engine
        this.rigidSprite.body.setPosition([pos[0], pos[1]-this.CLIMB_SPEED]);
    }

    update()
    {

        // reset rotation just in case
        this.rigidSprite.body.setRotation(0);
        // handle key presses
        if (this.keys.LEFT)
        {
            this.goLeft();
        }
        if (this.keys.RIGHT)
        {
            this.goRight();
        }
        if (this.keys.UP && !(this.keys.SPACE && this.canBuild))
        {
            this.goUp();
        }

        // force the player to not fall due to gravity if they are climbing
        if (this.isClimbing)
        {
            var vel:number[] = this.rigidSprite.body.getVelocity();
            this.rigidSprite.body.setVelocity([vel[0], 0]);
        }

        // at the end of every update, erase climbing information.
        // If the player continues to intersect the object, then we'll detect that again before the next update
        if (!this.canClimb) {
            this.isClimbing = false;
        }
        this.canClimb = false;
        this.canBuild = false;
    }

    // draws the player's sprite to the screen
    draw(draw2D:Draw2D, offset:number[])
    {
        if (this.facing == Direction.LEFT) {
            this.rigidSprite.sprite.setTextureRectangle([256, 0, 0, 256]);
        } else {
            this.rigidSprite.sprite.setTextureRectangle([0, 0, 256, 256]);
        }

        this.rigidSprite.draw(draw2D, offset);
    }
}