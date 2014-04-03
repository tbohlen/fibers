/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />

/// <reference path="rigidSprite.ts"/>

class Player {
    SPEED = 0.1;
    JUMP_SPEED = 0.4;

    isJumping:boolean = false;
    rigidSprite:RigidSprite = null;

    constructor (rigidSprite, position:number[])
    {
        this.rigidSprite = rigidSprite;
        this.rigidSprite.body.setPosition(position); // should be added to rigidSprite...

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
    draw(draw2D:Draw2D)
    {
        this.rigidSprite.draw(draw2D);
    }
}