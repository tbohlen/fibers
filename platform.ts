/**
 * Created by martelly on 4/1/2014.
 */

/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>

class Platform {
    rigidSprite:RigidSprite = null;
    body:Physics2DRigidBody = null;

    constructor (phys2D:Physics2DDevice, world:Physics2DWorld)
    {
        var shapeSize = 20;
        var platformMaterial:Physics2DMaterial = phys2D.createMaterial({
            elasticity : 0,
            staticFriction : 0,
            dynamicFriction : 0
        });
        var shapes : Physics2DShape[] = [
            phys2D.createPolygonShape({
                vertices : phys2D.createRectangleVertices(-shapeSize/2, -shapeSize/2, shapeSize/2, shapeSize/2),
                material : platformMaterial
            })
        ];
        this.body = phys2D.createRigidBody({
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
        world.addRigidBody(this.body);
        this.rigidSprite = new RigidSprite(sprite, [0,0], 0, this.body);
    }

    draw(draw2D:Draw2D, offset:number[])
    {
        this.rigidSprite.draw(draw2D, offset);
    }
}