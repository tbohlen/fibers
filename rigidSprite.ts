/*
 * Class: RigidSprite
 *
 * This class contains a sprite and a rigid body and deals with moving the sprite to display it where the rigid body is.
 */

class RigidSprite {

    sprite:Draw2DSprite = null;
    body:Physics2DRigidBody = null;

    constructor (sprite:Draw2DSprite, body:Physics2DRigidBody) {
        this.sprite = sprite;
        this.body = body;
    }

    draw(draw2D:Draw2D) {
        // update the sprite position
        var pos:number[] = this.body.getPosition();
        this.sprite.x = pos[0];
        this.sprite.y = pos[1];
        // and draw it to the screen
        draw2D.drawSprite(this.sprite);
    }
}