class Player {
    SPEED = 2;

    _position:number[] = [0,0];
    vx:number = 0;

    getPosition(): number[] {
        return this._position;
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
        this._position[0] += this.vx;
        if (this._position[0] < 0)
        {
            this._position[0] = 0;
        }
    }
}