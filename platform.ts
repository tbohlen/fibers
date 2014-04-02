/**
 * Created by martelly on 4/1/2014.
 */
/// <reference path="rigidSprite.ts"/>

class Platform {
    rigidSprite:RigidSprite = null;

    constructor (phys2D:Physics2DDevice, world:Physics2DWorld)
    {
        var shapeSize = 20;
        var platformMaterial = phys2D.createMaterial({
            elasticity : 0,
            staticFriction : 10,
            dynamicFriction : 8
        });
        var shapes : Physics2DShape[] = [
            phys2D.createPolygonShape({
                vertices : phys2D.createRectangleVertices(0, 0, shapeSize, shapeSize),
                material : platformMaterial
            })
        ];
        var body:Physics2DRigidBody = phys2D.createRigidBody({
            type : 'kinematic',
            shapes : shapes,
            position : [150, 200]
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: shapeSize,
            height: shapeSize,
            origin : [shapeSize / 2, shapeSize / 2],
            color: [0.3, .3, 1.0, 1.0]
        });
        world.addRigidBody(body);
        this.rigidSprite = new RigidSprite(sprite, body);
    }

    draw(draw2D:Draw2D)
    {
        this.rigidSprite.draw(draw2D);
    }
}