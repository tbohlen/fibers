class Player {
    SPEED = 2;

    position:number[] = [0,0];
    vx:number = 0;
    sprite:any = null;

    constructor (playerSprite, position:number[])
    {
        this.sprite = playerSprite;
        this.position = position;
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
        return this.position;
    }

    stopWalking()
    {
        this.vx = 0;
    }

    walkLeft()
    {
        this.vx = -1*this.SPEED;
    }

    walkRight()
    {
        this.vx = this.SPEED;
    }

    update()
    {
        this.position[0] += this.vx;
        if (this.position[0] < 0)
        {
            this.position[0] = 0;
        }
    }

    // draws the player's sprite to the screen
    draw(draw2D)
    {
        this.sprite.x = this.position[0];
        this.sprite.y = this.position[1];
        draw2D.drawSprite(this.sprite);
    }
}