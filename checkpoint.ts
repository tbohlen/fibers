/**
 * Created by martelly on 4/13/2014.
 */

/// <reference path="interfaces.ts"/>
/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="Timer.ts"/>

class CheckpointManager
{
    allCheckpoints:Checkpoint[];
    completedCheckpoints:Checkpoint[]; // arranged in chronological order
    game:GameObject;

    constructor ()
    {
        this.allCheckpoints = [];
        this.completedCheckpoints = [];
    }

    setGameObject(game:GameObject):void
    {
        this.game = game;
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
	
	public removeAllCheckpoints():void
	{
		this.allCheckpoints = [];
		this.completedCheckpoints = [];
        this.game.collisionHelp.removeAllCheckpoints();
	}
}

class Checkpoint implements Interactable
{
    body:Physics2DRigidBody;
    completed:boolean;
    name:String;
    checkpointManager:CheckpointManager;
    completedCallback:Function;
    constructor (options:CheckpointOptions)
    {
        this.body = options.body;
        this.name = options.name;
        this.completed = options.completed == true; // need check since it could be null
        this.checkpointManager = options.checkpointManager;
        this.completedCallback = options.hasOwnProperty("completedCallback") ? options.completedCallback : function (){}
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

        var progressCallback:Function = function(){};
        if (obj.properties.hasOwnProperty("progress"))
        {
            progressCallback = function()
            {
                console.log("progress callback called")
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
                    console.log("checkpoint behavior undefined for a progress:" + obj.properties.progress);
                }
            };
        }
        var yarnBallCallback:Function = function(){
            progressCallback();
        };
        if (obj.properties.hasOwnProperty("yarn"))
        {
            console.log("yarn checkpoint");
            yarnBallCallback = function()
            {
                console.log(obj.properties.yarn);
                if (obj.properties.yarn == "true")
                {
                    game.progression.addYarnBall(); // will cause animation
                    game.sfx.setCurrentFX(game.sfx.collectYarnSFX);
                    Sequence.makeSequence(game, "animateYarnBall",[
                        new SequenceAction(game, 0, function() {
                            game.keyboard.toggleKeyboard(false);
                        }),
                        new SequenceAction(game, 4, progressCallback),
                        new SequenceAction(game, 0, function() {
                            game.keyboard.toggleKeyboard(true);
                        })
                    ]);
                } else
                {
                    console.log("no yarn ball added");
                    progressCallback();
                }
            }
        }

        var allCallbacks:Function = function(){
            progressCallback();
            yarnBallCallback();
        };

        var cp:Checkpoint = new Checkpoint({
            body : body,
            name : name,
            checkpointManager : game.checkpointManager,
            completedCallback : yarnBallCallback
        });
        game.collisionHelp.pushCheckpoint(cp);
        game.checkpointManager.pushCheckpoint(cp);
        return null; // return null since this is not a rigid sprite
    }

    playerCollideCallback(player:Player):void
    {
        if (!this.completed)
        {
            this.completed = true;
            this.checkpointManager.completeCheckpoint(this);
            this.completedCallback();
            console.log("yeah! You completed a checkpoint");
        }

    }

    getShapes():Physics2DShape[]
    {
        return this.body.shapes;
    }
}
