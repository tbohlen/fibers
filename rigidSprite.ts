/*
 * Class: RigidSprite
 *
 * This class contains a sprite and a rigid body and deals with moving the sprite to display it where the rigid body is.
 *
 * TODO: Switch to a parameters object
 */

class RigidSprite {

    public sprite:Draw2DSprite = null;
    public body:Physics2DRigidBody = null;
    gid:number; // represents the tile on te large texture graphic to use to display this sprite
    initialPos:number[];

    constructor (options:RigidSpriteOptions) {
        this.sprite = options.sprite;
        this.initialPos = options.initialPos;
        this.sprite.x = options.initialPos[0];
        this.sprite.y = options.initialPos[1];
        this.gid = (options.gid ? options.gid : 0);

        if (options.body) {
            this.body = options.body;
            this.body.setPosition(options.initialPos);
        }
    }

    draw(draw2D:Draw2D, offset) {
        // update the sprite position if there is a rigid body. Otherwise, leave the sprite where it is
        if (this.body != null)
        {
            var pos:number[] = this.body.getPosition();
            this.sprite.x = pos[0];
            this.sprite.y = pos[1];
            this.sprite.rotation = this.body.getRotation();
        } else
        {
            this.sprite.x = this.initialPos[0];
            this.sprite.y = this.initialPos[1];
        }

        this.sprite.x -= offset[0];
        this.sprite.y -= offset[1];

        // and draw it to the screen
        draw2D.drawSprite(this.sprite);
    }
}