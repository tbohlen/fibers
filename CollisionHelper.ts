/**
 * This class is meant to accept arrays of objects with associated shapes.
 */

/// <reference path="interfaces.ts"/>
/// <reference path="player.ts"/>

class CollisionHelper
{
    public collisionUtils:Physics2DCollisionUtils;
    private interactables:Interactable[];
    private player:Player = null;

    public constructor(physicsDevice:Physics2DDevice)
    {
        this.collisionUtils = physicsDevice.createCollisionUtils();
        this.interactables = [];
    }

    public setPlayer(player:Player):void
    {
        this.player = player;
    }

    public pushInteractable(object:Interactable):void
    {
        this.interactables.push(object);
    }

    /**
     * Should be run every time step in the main loop
     */
    public checkCollision():void
    {
        // check collisions with player
        if (this.player == null)
        {
            console.log("Player has not been set in CollisionHelper yet");
        }
        for (var i:number = 0; i < this.interactables.length; i++)
        {
            var current:Interactable = this.interactables[i];
            var playerShape:Physics2DShape = this.player.rigidSprite.body.shapes[0];
            var otherShapes:Physics2DShape[] = current.getShapes();
            for(var j:number = 0; j < otherShapes.length; j++) {
                var otherShape:Physics2DShape = otherShapes[j];
                if (this.collisionUtils.intersects(playerShape, otherShape))
                {
                    current.playerCollideCallback();
                    this.player.collisionCallback(current);
                    break;
                }
            }
        }
    }
}