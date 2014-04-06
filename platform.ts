/**
 * Created by martelly on 4/1/2014.
 */

/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>

class Platform extends RigidSprite{
    game:GameObject = null;

    constructor (options:RigidSpriteOptions, game:GameObject)
    {
        super(options);
        this.game = game;
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject):Platform
    {
        console.log('object coming');
        console.log(obj);
        if (!(obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width")
            && obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties")))
        {
            console.log("failed to make platform");
        }

        var phys2D = game.physicsDevice;
        var world = game.physicsWorld;
        var platformMaterial:Physics2DMaterial = phys2D.createMaterial({
            elasticity : 0,
            staticFriction : .3,
            dynamicFriction : 0.2
        });
        var shapes : Physics2DShape[] = [
            phys2D.createPolygonShape({
                vertices : phys2D.createBoxVertices(obj.width, obj.height),
                material : platformMaterial,
                group: 8,
                mask: 13
            })
        ];
        var body = phys2D.createRigidBody({
            type : 'kinematic',
            shapes : shapes,
            position : [obj.x-obj.width/2, obj.y-obj.y/2]
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            position : [obj.x, obj.y],
            color: [0.3, .3, 1.0, 1.0]
        });
        world.addRigidBody(body);

        var rigidSpriteParams = {
            sprite : sprite,
            initialPos : [sprite.x, sprite.y],
            body : body
        }

        return new Platform(rigidSpriteParams, game);
    }
}