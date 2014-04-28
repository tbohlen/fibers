/**
 * Created by martelly on 4/13/2014.
 */

/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>

class Button extends RigidSprite
{
    public static debugColor:number[] = [0.8, .3, 1.0, 0.2];
    game:GameObject;

    constructor(options:RigidSpriteOptions, game:GameObject)
    {
        super(options);
        this.game = game;
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject):Button
    {
        var phys2D = game.physicsDevice;

        var vertices:number[][] = [[0,0], [obj.width,0], [obj.width, obj.height], [0, obj.height]];

        var shapes : Physics2DShape[] = [
            phys2D.createPolygonShape({
                vertices : vertices,
                group: 8,
                mask: 13
            })
        ];
        var body = phys2D.createRigidBody({
            type : 'static',
            shapes : shapes,
            position : [obj.x, obj.y]
        });

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

        var but: Button =  new Button(rigidSpriteParams, game);
        var callback = but.clicked;
        if (obj.properties.hasOwnProperty("nextState") && obj.properties.nextState in window )
        {
            callback = function()
            {
                if (obj.properties.hasOwnProperty("stateArgs"))
                {
                    game.nextState = new window[obj.properties.nextState](game, obj.properties.stateArgs)
                } else
                {
                    game.nextState = new window[obj.properties.nextState](game);
                }
            }
        } else if (obj.properties.hasOwnProperty("progress"))
        {
            callback = function()
            {
                if (obj.properties.progress == "start")
                {
                    game.nextState = game.progression.resetToStartState();
                } else if (obj.properties.progress == "next")
                {
                    game.nextState = game.progression.getNextState();
                } else if (obj.properties.progress == "current")
                {
                    game.nextState = game.progression.getNewCurrentState();
                } else {
                    console.log("button behavior undefined for a progress");
                }
            };
        }
        // add event listener
        game.keyboard.addEventListener("mouseup",
            function() { // shape thing
                return but.body.shapes[0];
            },
            callback
        );
        return but;
    }

    draw(draw2D:Draw2D, offset:number[])
    {
        this.sprite.setColor(Button.debugColor);
        super.draw(draw2D, offset);
    }

    clicked():void
    {
        var nextState;
        var stateArgs;
        console.log("This button has been clicked");
    }
}