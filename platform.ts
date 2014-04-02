/**
 * Created by martelly on 4/1/2014.
 */
/// <reference path="rigidSprite.ts"/>

class Platform {
    rigidSprite:RigidSprite = null;

    constructor (physDev:Physics2DDevice, world:Physics2DWorld)
    {
        var sprite:Draw2DSprite = Draw2DSprite.create({
            x: 20,
            y: 20,
            width: 64,
            height: 128,
            color: [0.3, .3, 1.0, 1.0]
        });
        var shapes : Physics2DShape[] = [
            physicsDevice.createPolygonShape({
                vertices : physicsDevice.createBoxVertices(5,5),
                position : [20, 20]
            })
        ];
        var body:Physics2DRigidBody = physDev.createRigidBody({
            type : 'static',
            shapes : shapes,
            position : [20,20]
        });
        world.addRigidBody(body);
        this.rigidSprite = new RigidSprite(sprite, body);
    }

    draw(draw2D:Draw2D)
    {
        this.rigidSprite.draw(draw2D);
    }
}