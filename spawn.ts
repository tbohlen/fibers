/// <reference path="interfaces.ts"/>

class Spawn
{
    location:number[];
    constructor(location:number[])
    {
        this.location = location;
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject)
    {
        var location:number[] = [obj.x, obj.y];
        game.spawn = new Spawn(location);
        return null;
    }
    getLocation():number[]
    {
        return this.location;
    }
}
