/*
 * Class: RigidSprite
 *
 * This class contains a sprite and a rigid body and deals with moving the sprite to display it where the rigid body is.
 *
 * TODO: Switch to a parameters object
 */

class RigidSprite {

    sprite:Draw2DSprite = null;
    body:Physics2DRigidBody = null;
    gid:number = 0; // represents the tile on te large texture graphic to use to display this sprite
    initialPos:number[];

    constructor (sprite:Draw2DSprite, initialPos:number[], gid:number, body?:Physics2DRigidBody) {
        this.sprite = sprite;
        this.initialPos = initialPos;
        this.sprite.x = initialPos[0];
        this.sprite.y = initialPos[1];
        this.gid = (gid ? gid : 0);

        if (body) {
            this.body = body;
            this.body.setPosition(initialPos);
        }
    }

    draw(draw2D:Draw2D, offset:number[]) {
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