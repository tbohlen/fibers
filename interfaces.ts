/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="CollisionHelper.ts"/>

interface InteractablesObject {
    buildables : Buildable[];
    climbables : Climbable[];
}

interface GameObject {
    engine : TurbulenzEngine;
    graphicsDevice : GraphicsDevice;
    inputDevice: InputDevice;
    draw2D : Draw2D;
    physicsDevice : Physics2DDevice;
    physicsWorld : Physics2DWorld;
    collisionHelp: CollisionHelper;
    debugMode : boolean;
    keys : KeyObject;
}

interface KeyObject {
    LEFT ?: boolean;
    RIGHT ?: boolean;
    UP ?: boolean;
    DOWN ?: boolean;
    SPACE ?: boolean;
    W ?: boolean;
    A ?: boolean;
    S ?: boolean;
    D ?: boolean;
    T ?: boolean;
    F ?: boolean;
    G ?: boolean;
    H ?: boolean;
}

interface RigidSpriteOptions {
    sprite : Draw2DSprite;
    initialPos : number[];
    gid ?: number;
    body ?: Physics2DRigidBody;
}

interface ChainOptions extends RigidSpriteOptions {
    initHeight ?: number;
    maxHeight : number;
    minHeight : number;
    width : number;
    rotation: number;
}

interface knitCubeOptions extends RigidSpriteOptions {
    maxDimension:number;
    minDimension:number;
}

interface Interactable {
    playerCollideCallback():void;
    getShape():Physics2DShape;
}

interface Buildable extends Interactable{
    /*
     * Method: buildUp
     * This is called whenever the player is overlapping with this object and presses the build up button.
     * The object implementing this interface needs to react accordingly.
     */
    buildUp():void;
    /*
     * Method: buildDown
     * This is called whenever the player is overlapping with this object and presses the build down button.
     * The object implementing this interface needs to react accordingly.
     */
    buildDown():void;
}


interface Climbable {
    isClimbable:boolean;
    shape?:Physics2DShape;

    /*
     * Method: isClimbableAtPosition
     * Returns whether a given position in object-space is climbable. This is an alternative
     * to specifying a geometric shape if you have some cool parametric way of describing
     * which regions are climbable (maybe overkill)
     */
    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, position: any[]):boolean;
}

class ClimbableDefault implements Climbable
{
    isClimbable:boolean = true;
    shape:Physics2DShape;

    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, position: any[]):boolean
    {
        return collisionUtil.containsPoint(this.getClimbableShape(), position);
    }

    getClimbableShape():Physics2DShape
    {
        return this.shape;
    }
}