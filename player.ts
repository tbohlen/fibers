class Player {
    SPEED = 2;

    sprite:any = null;
    body:any = null;

    constructor (playerSprite, playerObject, position:number[])
    {
        this.sprite = playerSprite;
        this.body = playerObject;
        this.body.setPosition(position);
    }

    // sets the texture used to display the character. If no texture is null, displays a white box
    setTexture(texture) {
        if (this.sprite != null)
        {
            this.sprite.setTexture(texture);
        }
    }

    // just calls into sprite
    setTextureRectangle(params)
    {
        if (this.sprite != null)
        {
            this.sprite.setTextureRectangle(params);
        }
    }

    getPosition(): number[] {
        return this.body.getPosition();
    }

    stopWalking()
    {
        var vel:number[] = this.body.getVelocity();
        this.body.setVelocity([0, vel[1]]);
    }

    walkLeft()
    {
        var vel:number[] = this.body.getVelocity();
        this.body.setVelocity([-1*this.SPEED, vel[1]]);
    }

    walkRight()
    {
        var vel:number[] = this.body.getVelocity();
        this.body.setVelocity([this.SPEED, vel[1]]);
    }

    update()
    {
    }

    // draws the player's sprite to the screen
    draw(draw2D)
    {
        var pos:number[] = this.body.getPosition();
        this.sprite.x = pos[0];
        this.sprite.y = pos[1];
        draw2D.drawSprite(this.sprite);
    }
}