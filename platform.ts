/**
 * Created by martelly on 4/1/2014.
 */

/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>

class Platform extends RigidSprite {
    public static debugColor:number[] = [0.3, .3, 1.0, 1.0];
    game:GameObject = null;

    constructor (options:RigidSpriteOptions, game:GameObject)
    {
        super(options);
        this.game = game;
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject):Platform
    {
        if (!(obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width")
            && obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties")))
        {
            console.log("failed to make platform");
            return;
        }

        var phys2D = game.physicsDevice;
        var world = game.physicsWorld;
        var platformMaterial:Physics2DMaterial = phys2D.createMaterial({
            elasticity : 0,
            staticFriction : .3,
            dynamicFriction : 0.2
        });

        var vertices:number[][] = [[0,0], [obj.width,0], [obj.width, obj.height], [0, obj.height]];

        var shapes : Physics2DShape[] = [
            phys2D.createPolygonShape({
                vertices : vertices,
                material : platformMaterial,
                group: 8,
                mask: 13
            })
        ];
        var body = phys2D.createRigidBody({
            type : 'static',
            shapes : shapes,
            position : [obj.x, obj.y]
        });
        world.addRigidBody(body);

        var sprite:Draw2DSprite = Draw2DSprite.create({
                width: obj.width,
                height: obj.height,
                x : obj.x,
                y : obj.y,
                origin : [0, 0],
                color: Platform.debugColor
        });

        var rigidSpriteParams = {
            sprite : sprite,
            initialPos : [sprite.x, sprite.y],
            body : body
        };

        return new Platform(rigidSpriteParams, game);
    }

    draw(draw2D:Draw2D, offset:number[])
    {
        if (this.game.debugMode){
            this.sprite.setColor(Platform.debugColor);
        } else {
            this.sprite.setColor([0,0,0,0]);
        }
        super.draw(draw2D, offset);
    }
}