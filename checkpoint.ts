/**
 * Created by martelly on 4/13/2014.
 */

/// <reference path="interfaces.ts"/>
/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>

class CheckpointManager
{
    allCheckpoints:Checkpoint[];
    completedCheckpoints:Checkpoint[]; // arranged in chronological order

    constructor ()
    {
        this.allCheckpoints = [];
        this.completedCheckpoints = [];
    }

    public pushCheckpoint(check:Checkpoint)
    {
        this.allCheckpoints.push(check);
        if (check.completed)
        {
            this.completedCheckpoints.push(check);
        }
    }

    public completeCheckpoint(check:Checkpoint):void
    {
        check.completed = true;
        this.completedCheckpoints.push(check);
    }

    public resetPosition():number[]
    {
        if (this.completedCheckpoints.length == 0)
        {
            return null;
        }
        var lastCheck:Checkpoint = this.completedCheckpoints[this.completedCheckpoints.length-1];
        console.log(lastCheck);
        return lastCheck.body.getPosition();
    }
}

class Checkpoint implements Interactable
{
    body:Physics2DRigidBody;
    completed:boolean;
    name:String;
    checkpointManager:CheckpointManager;
    constructor (options:CheckpointOptions)
    {
        this.body = options.body;
        this.name = options.name;
        this.completed = options.completed == true; // need check since it could be null
        this.checkpointManager = options.checkpointManager;
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
            name : name,
            checkpointManager : game.checkpointManager
        });
        game.collisionHelp.pushInteractable(cp);
        game.checkpointManager.pushCheckpoint(cp);
        return null; // return null since this is not a rigid sprite
    }

    playerCollideCallback(player:Player):void
    {
        if (!this.completed)
        {
            this.completed = true;
            this.checkpointManager.completeCheckpoint(this);
            console.log("yeah! You completed a checkpoint");
        }
    }

    getShapes():Physics2DShape[]
    {
        return this.body.shapes;
    }
}
