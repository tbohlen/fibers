/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />

interface GameObject {
    engine : TurbulenzEngine;
    graphicsDevice : GraphicsDevice;
    inputDevice: InputDevice;
    draw2D : Draw2D;
    physicsDevice : Physics2DDevice;
    physicsWorld : Physics2DWorld;
    debugMode : boolean;
    keys : KeyObject;
}

interface InteractablesObject {
    buildables : Buildable[];
    climbables : any[];
}

interface KeyObject {
    LEFT ?: boolean;
    RIGHT ?: boolean;
    UP ?: boolean;
    W ?: boolean;
    A ?: boolean;
    S ?: boolean;
    D ?: boolean;
}

interface RigidSpriteOptions {
    sprite : Draw2DSprite;
    initialPos : number[];
    gid ?: number;
    body ?: Physics2DRigidBody;
}

interface ChainOptions extends RigidSpriteOptions {
    maxHeight:number;
    minHeight:number;
    width:number;
}

interface Buildable {
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
    /*
     * Method: getBuildableShape
     * Returns the shape that the player must be overlapping with in order to build this item. ie the knitting needles.
     */
    getBuildableShape():Physics2DShape;
}
