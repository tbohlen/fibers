/// <reference path="rigidSprite.ts"/>

class Player {
    SPEED = 0.1;

    rigidSprite:RigidSprite = null;

    constructor (rigidSprite, position:number[])
    {
        this.rigidSprite = rigidSprite;
        this.rigidSprite.body.setPosition(position); // should be added to rigidSprite...
    }

    // sets the texture used to display the character. If no texture is null, displays a white box
    setTexture(texture) {
        if (this.rigidSprite.sprite != null)
        {
            this.rigidSprite.sprite.setTexture(texture);
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

    update()
    {
    }

    // draws the player's sprite to the screen
    draw(draw2D:Draw2D)
    {
        this.rigidSprite.draw(draw2D);
    }
}