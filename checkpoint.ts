/**
 * Created by martelly on 4/13/2014.
 */

/// <reference path="interfaces.ts"/>
/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>

class Checkpoint implements Interactable
{
    body:Physics2DRigidBody;
    completed:boolean;
    name:String;
    constructor (options:CheckpointOptions)
    {
        this.body = options.body;
        this.name = options.name;
        this.completed = options.completed == true; // need check since it could be null
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject):Checkpoint
    {
        var vertices:number[][] = [[0,0], [obj.width,0], [obj.width, obj.height], [0, obj.height]];
        var shapes : Physics2DShape[] = [
            game.physicsDevice.createPolygonShape({
                vertices : vertices
            })
        ];
        var body : Physics2DRigidBody = game.physicsDevice.createRigidBody({
            shapes : shapes,
            type : 'static',
            position : [obj.x, obj.y]
        });
        var name:String;
        if (obj.properties.hasOwnProperty("checkpointName")) {
             name = String(obj.properties.checkpointName);
        }
        else
        {
            name = "Untitled checkpoint";
        }

        var cp:Checkpoint = new Checkpoint({
            body : body,
            name : name
        });
        game.collisionHelp.pushInteractable(cp);
        return null; // return null since this is not a rigid sprite
    }

    playerCollideCallback(player:Player):void
    {
        if (!this.completed)
        {
            this.completed = true;
            console.log("yeah! You completed a checkpoint");
        }
    }

    getShapes():Physics2DShape[]
    {
        return this.body.shapes;
    }
}