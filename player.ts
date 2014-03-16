class Player {
    SPEED = 2;

    position:number[] = [0,0];
    vx:number = 0;

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
}