/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="animatedTexture.ts"/>
/// <reference path="masks.ts"/>

// a player's sprite is an instance of an animated sprite, which has a
// direction (facing), possibly multiple animated sprite sheets,
// and each sheet has a corresponding cycle time.

// should refactor the player as a state machine...
// this is a mess :'(

class Player {
    SPEED = 0.2;
    JUMP_SPEED = 0.5;
    DIST_EPSILON = 0.25;
    CLIMB_SPEED = 2;
    THRESHOLD_STANDING_SPEED = 0.001;

    canClimb:boolean = false;
    isClimbing:boolean = false;
    climbableObject:Climbable = null;
    canBuild:boolean = false;
    rigidSprite:RigidSprite = null;

    leftBlockingShape:Physics2DShape = null;
    rightBlockingShape:Physics2DShape = null;
    lastTouchedPullable:Rectangle = null;

    onGround:boolean = false; // true if the player is standing on the ground, or was last time we checked
    groundShape: Physics2DShape = null; // the last surface the player was standing on

    facing:Direction = Direction.RIGHT;

    // pulling
    isPulling:boolean = false;
    pulledObject:Rectangle = null;

    standTexture:AnimatedTexture = new AnimatedTexture("assets/player/stand.png", [256, 256], 3, true);
    walkTexture:AnimatedTexture = new AnimatedTexture("assets/player/walk.png", [256, 256], 8, true);
    jumpTexture:AnimatedTexture = new AnimatedTexture("assets/player/jump.png", [256, 256], 5, false);
    climbTexture:AnimatedTexture = new AnimatedTexture("assets/player/climb.png", [256, 256], 6, true);
    pullTexture:AnimatedTexture = new AnimatedTexture("assets/player/pull.png", [256, 256], 8, true);
    currentTexture:AnimatedTexture = null;

    frameDimensions:number[] = [256, 256];
    animationFrameDurationMS:number = 100;
    animationTimeout:number = null;

    lastClimbPosition:number[] = null;

    playerDimensions:number[] = [128, 128];
    playerHitBox:number[][] = [
        [-20, -52],
        [20, -52],
        [20, 64],
        [-20, 64]
    ];

    keys:any;
    collisionUtil:Physics2DCollisionUtils;
    mathDevice:MathDevice;
    game:GameObject;

    // should not have to do this. A little ridiculous.
    loadTextures(graphicsDevice:GraphicsDevice)
    {
        // import an image to use as the player display and when loading is done set it as the player's texture
        this.standTexture.loadTexture(graphicsDevice);
        this.walkTexture.loadTexture(graphicsDevice);
        this.jumpTexture.loadTexture(graphicsDevice);
        this.climbTexture.loadTexture(graphicsDevice);
        this.pullTexture.loadTexture(graphicsDevice);
        this.setCurrentTexture(this.standTexture);
    }

    constructor (game:GameObject, position:number[])
    {
        this.game = game;
        this.collisionUtil = game.collisionHelp.collisionUtils;
        this.mathDevice = game.mathDevice;
        // build the player sprite
        var playerParams:any = {
            x: position[0],
            y: position[1],
            width: this.playerDimensions[0],
            height: this.playerDimensions[1],
            color: [1.0, 1.0, 1.0, 1.0]
        };
        var playerSprite:Draw2DSprite = Draw2DSprite.create(playerParams);
//        var playerVertices:number[][] = game.physicsDevice.createRectangleVertices(-this.playerHitBox[0]/2, -this.playerHitBox[1]/2,
//                this.playerHitBox[0]/2, this.playerHitBox[1]/2);

        var playerShape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: this.playerHitBox,
            group: ShapeGroups.PLAYER,
            mask: ObjectMasks.SOLID
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
        this.animationTimeout = window.setInterval(
            ()=> {
                if (this.currentTexture)
                {
                    this.currentTexture.updateCurrentFrame();
                }
            }, this.animationFrameDurationMS);

        this.jumpTexture.keyframes = [1,4];

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

    // only change the currentTexture if it is actually different.
    // if so, reset the texture loop.
    setCurrentTexture(texture:AnimatedTexture)
    {
        if (texture != this.currentTexture)
        {
//            if (texture && this.currentTexture) {
//                console.log("changing texture from: " + this.currentTexture.textureFile + " to: " + texture.textureFile);
//            }
            this.currentTexture = texture;
            this.currentTexture.resetLoop();
            this.currentTexture.play();
        }
    }

    getTextureFrameCount():number {
        if (this.rigidSprite.sprite != null && this.rigidSprite.sprite.getTexture() != null) {
            return Math.floor(this.rigidSprite.sprite.getTexture().width / this.frameDimensions[0]);
        }
        return 1;
    }

    // checks all collisions
    // TODO: combine this and the next function in some nice way
    checkCollision = (arbiter, otherShape) =>
    {
        // whenever we hit another shape, check to see if it counts as ground
        // TODO: Wrap this normal test into the stillOnGround function
        var normal:number[] = arbiter.getNormal();
        if (normal[1] > 0 && normal[1] > Math.abs(normal[0]))
        {
            this.onGround = true;
            this.groundShape = otherShape;
        }

        // also need to check if this stopped us from moving left or right in the air
        if (normal[0] > 0)
        {
            this.rightBlockingShape = otherShape;
        }
        else if (normal[0] < 0)
        {
            this.leftBlockingShape = otherShape;
        }
    }

    // only checks collisions with interactables
    collisionCallback(otherObject):void
    {
        // check for climbable and if climbable, set canClimb and save the object
        if (otherObject.hasOwnProperty("isClimbable") && otherObject.isClimbable) {
            this.climbableObject = <Climbable>otherObject;
            this.canClimb = this.climbableObject.isClimbableAtObjectPosition(this.collisionUtil, this.rigidSprite.body.shapes[0]);
        }
        // check for buildable and set canBuild
        if (otherObject.hasOwnProperty("isBuildable") && otherObject.isBuildable) {
            this.canBuild = true;
        }

        if (otherObject.isPullable) {
            this.lastTouchedPullable = otherObject;
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

    setPosition(pos:number[]) {
        this.rigidSprite.body.setPosition(pos);
    }

    stopWalking()
    {
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([0, vel[1]]);
    }

    pull(rect:Rectangle)
    {
        if (!this.pulledObject) {
            this.pulledObject = rect;
            this.isPulling = true;
            rect.isBeingPulled = true;
            this.walkTexture.reverse();
            //console.log("PULLING!");
        }
    }

    release(rect:Rectangle)
    {
        if (this.isPulling) {
            rect.isBeingPulled = false;
            this.isPulling = false;
            this.pulledObject = null;
            this.walkTexture.reverse();
            //console.log("RELEASED!");
        }
    }

    walkLeft()
    {
        // we should only be allowed to walk if we are on the ground.
        var vel:number[] = this.rigidSprite.body.getVelocity();
        var newVel:number[] = [-1*this.SPEED, vel[1]];
        this.rigidSprite.body.setVelocity(newVel);
        if (!this.isPulling) {
            this.facing = Direction.LEFT;
        }
    }

    walkRight()
    {
        var vel:number[] = this.rigidSprite.body.getVelocity();
        var newVel:number[] = [this.SPEED, vel[1]];
        this.rigidSprite.body.setVelocity(newVel);
        if (!this.isPulling) {
            this.facing = Direction.RIGHT;
        }
    }

    goDown()
    {
        // if we can climb then start climbing. Otherwise, do nothing
        if (this.canClimb)
        {
            this.isClimbing = true;
            this.climb();
        }
    }
        
    goUp()
    {
        // if we can climb then start climbing. Otherwise, do nothing
        if (this.canClimb) {
            this.isClimbing = true;
            this.climb();
        }
    }

    jumpUp()
    {
        if (this.pulledObject) {
            this.release(this.pulledObject);
        }

        this.groundShape = null;
        this.onGround = false;
        this.isClimbing = false;
        this.lastClimbPosition = null;
        var vel:number[] = this.rigidSprite.body.getVelocity();
        this.currentTexture.play();
        this.rigidSprite.body.setVelocity([vel[0], -1*this.JUMP_SPEED]);
    }

    stillOnGround():boolean
    {
        // the player can leave the ground without us noticing in the collision detection,
        // so we need to be able to double check that they are still on the ground.
        // That happens here
        var witA:number[] = [];
        var witB:number[] = [];
        var axis:number[] = [];
        if (this.groundShape != null && this.onGround) {
            // for them still to be on the ground they have to be intersecting with it AND the axis between
            // the ground and them must be at a 45 degree angle or higher (otherwise they are "slipping")
            var dist:number = this.game.collisionHelp.collisionUtils.signedDistance(this.rigidSprite.body.shapes[0], this.groundShape, witA, witB, axis);
            var isOnGround:boolean = (axis[1] >= 0 && axis[1] > axis[0] && dist < this.DIST_EPSILON);
//            if (!isOnGround){
//                console.log("not on ground... axes: [" + axis[0] + ", " + axis[1] + "] dist: " + dist);
//            }
            return isOnGround;
        } else {
            return false;
        }
    }

    canMoveLeft():boolean
    {
        // one can move left if they are on the ground or if they are climbing or if there is no shape blocking them
        if (this.onGround || this.isClimbing || this.leftBlockingShape == null || this.leftBlockingShape.body == null)
        {
            return true;
        }
        else
        {
            return !this.game.collisionHelp.collisionUtils.intersects(this.rigidSprite.body.shapes[0], this.leftBlockingShape);
        }
    }

    canMoveRight():boolean
    {
        // one can move right if they are on the ground or if they are climbing or if there is no shape blocking them
        if (this.onGround || this.isClimbing || this.rightBlockingShape == null || this.rightBlockingShape.body == null)
        {
            return true;
        } else
        {
            return !this.game.collisionHelp.collisionUtils.intersects(this.rigidSprite.body.shapes[0], this.rightBlockingShape);
        }
    }

    flipFacing()
    {
        this.facing = (this.facing == Direction.LEFT) ? Direction.RIGHT : Direction.LEFT;
    }

    climb()
    {
        // make the player kinematic so they can't fall
        //this.rigidSprite.body.setAsKinematic();
        // calculate the movement direction
        var dir:number[] = [0, 0];
        if (this.game.keyboard.keyPressed("LEFT"))
        {
            dir[0] -= 1;
            this.facing = Direction.LEFT;
        }
        if (this.game.keyboard.keyPressed("RIGHT"))
        {
            dir[0] += 1;
            this.facing = Direction.RIGHT;
        }
        if (this.game.keyboard.keyPressed("UP") && !(this.game.keyboard.keyPressed("E") && this.canBuild))
        {
            dir[1] -= 1;
        }
        if (this.game.keyboard.keyPressed("DOWN") && !(this.game.keyboard.keyPressed("E") && this.canBuild))
        {
            dir[1] += 1;
        }

        if (dir[1] == 0 )
        {
            this.currentTexture.pause();
        } else {
            this.currentTexture.play();
        }

//        var vectorDir:any = this.mathDevice.v2Build(dir[0], dir[1]);
//        var normalizedDir:any = this.mathDevice.v2Normalize(vectorDir);

        var vectorLength:number = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
        if (vectorLength > 0) {
            var normalizedDir:number[] = [dir[0] / vectorLength, dir[1] / vectorLength];
            var pos:number[] = this.rigidSprite.body.getPosition();
            var nextPos:number[] = [pos[0] + (normalizedDir[0] * this.CLIMB_SPEED), pos[1] + (normalizedDir[1] * this.CLIMB_SPEED)];

            // XXX: this is dangerous teleportation! Could break physics engine
            this.rigidSprite.body.setPosition(nextPos);

            // if the player is going to move beyond the top of the climbable, stop them
            // don't know a better way to do this than to just move the object
            var witA:number[] = [];
            var witB:number[] = [];
            var axis:number[] = [];
            var dist = this.collisionUtil.signedDistance(this.climbableObject.getClimbableShape(), this.rigidSprite.body.shapes[0], witA, witB, axis);
            if (!this.climbableObject.isClimbableAtObjectPosition(this.collisionUtil, this.rigidSprite.body.shapes[0])
                && axis[1] < 0 && axis[0] * dist < this.DIST_EPSILON)
            {
                this.rigidSprite.body.setPosition(pos);
            }
        }

        // prevent drift
        var currentPos:number[] = this.rigidSprite.body.getPosition();
        if (this.lastClimbPosition != null)
        {
            currentPos[0] = (dir[0] == 0) ? this.lastClimbPosition[0] : currentPos[0];
            currentPos[1] = (dir[1] == 0) ? this.lastClimbPosition[1] : currentPos[1];
            this.rigidSprite.body.setPosition(currentPos);
        }

        // save current pos
        this.lastClimbPosition = currentPos;
    }


    // consolidate texture updates based on the current player state.
    // call within update(). This is a step towards refactoring the player into a finite state machine.
    updateTexture()
    {
        if (this.isClimbing)
        {
            // when player y center ( = their y position) exceeds the top of the climbable object (y position - height),
            // use stand texture instead...
            var showClimbAnimation:boolean = this.rigidSprite.body.getPosition()[1] > this.climbableObject.getTopPosition();
            if (showClimbAnimation)
            {
                this.setCurrentTexture(this.climbTexture);
            } else
            {
                this.setCurrentTexture(this.standTexture);
            }
        } else
        {
            if (this.onGround)
            {
                var isStill:boolean = (Math.abs(this.rigidSprite.body.getVelocity()[0]) < this.THRESHOLD_STANDING_SPEED);
                if (isStill)
                {
                    this.setCurrentTexture(this.standTexture);
                } else {
                    if (this.isPulling)
                    {
                        this.setCurrentTexture(this.pullTexture);
                    } else
                    {
                        this.setCurrentTexture(this.walkTexture);
                    }
                }
            } else
            {
                this.setCurrentTexture(this.jumpTexture);
            }
        }

        if (this.currentTexture.texture)
        {
            this.setTexture(this.currentTexture.texture);
            this.setTextureRectangle(this.currentTexture.currentFrameRectangle(this.facing));
        }
    }

    lastTouchedPullableDirection():Direction
    {
        if (this.lastTouchedPullable)
        {
            var signedDist:number = this.lastTouchedPullable.body.getPosition()[0] - this.getPosition()[0];
            if (signedDist < 0){
                return Direction.RIGHT;
            }
        }
        return Direction.LEFT;
    }

    tryToPull()
    {
        if ((this.game.keyboard.keyPressed("LEFT") || this.game.keyboard.keyPressed("RIGHT")) &&
            this.game.keyboard.keyPressed("E") &&
            this.lastTouchedPullable &&
            this.onGround &&
            !this.isPulling)
        {
            var rectPos:any[] = this.lastTouchedPullable.body.getPosition();
            var playerPos:any[] = this.getPosition();

            var distToPullable:number = Math.abs(rectPos[0] - playerPos[0]);
            var threshold:number = this.playerDimensions[0]/2 + 30;
            var isNotAbove:boolean = (rectPos[1] <= (playerPos[1] + this.playerDimensions[1]/2 + 16));

            if ((distToPullable < threshold) && isNotAbove)
            {
                this.pull(this.lastTouchedPullable);
            }
        }
    }

    update()
    {
        // reset rotation just in case
        this.rigidSprite.body.setRotation(0);

        // double check that we are on the ground
        this.onGround = this.stillOnGround();

        // reset back to last checkpoint when R is pressed
        if (this.game.keyboard.keyPressed("R"))
        {
            var resetPosition:number[] = this.game.checkpointManager.resetPosition();
            if (resetPosition != null) {
                this.rigidSprite.body.setPosition(resetPosition);
            }
        }

        if (!this.game.keyboard.keyPressed("E") && this.pulledObject != null)
        {
            this.release(this.pulledObject);
        }

        // to be allowed to jump you either have to be climbing or have to be on the ground
        if (this.game.keyboard.keyPressed("SPACE") && (this.isClimbing || this.onGround))
        {
            this.rigidSprite.body.setAsDynamic();
            //console.log("JUMPING!");
            this.jumpUp();
        } else if (this.isClimbing)
        {
            // if we didn't jump and instead are climbing, move around
            this.climb();
        } else if (!this.isClimbing) {
            this.rigidSprite.body.setAsDynamic();
            // handle key presses
            if (this.game.keyboard.keyPressed("LEFT") && this.canMoveLeft()) {
                this.walkLeft();
            }
            if (this.game.keyboard.keyPressed("RIGHT") && this.canMoveRight()) {
                // verify that pullable is nearby
                this.walkRight();
            }
            if (this.game.keyboard.keyPressed("UP") && !(this.game.keyboard.keyPressed("E") && this.canBuild)) {
                this.goUp();
            }
            if (this.game.keyboard.keyPressed("DOWN") && !(this.game.keyboard.keyPressed("E") && this.canBuild)) {
                this.goDown();
            }
            this.tryToPull();
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
            this.lastClimbPosition = null;
        }
        this.canClimb = false;
        this.canBuild = false;

        if (this.isPulling && this.rigidSprite.body){
            this.pulledObject.body.setVelocity(this.rigidSprite.body.getVelocity());
            this.facing = this.lastTouchedPullableDirection();
        }

        this.updateTexture();
    }

    // draws the player's sprite to the screen
    draw(draw2D:Draw2D, offset:number[])
    {
        this.rigidSprite.draw(draw2D, offset);
    }
}