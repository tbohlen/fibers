/**
 * Created by martelly on 4/24/2014.
 */

/// <reference path="interfaces.ts"/>
/// <reference path="CutsceneState.ts"/>
/// <reference path="MenuState.ts"/>
/// <reference path="PlayState.ts"/>

class Progression
{
    game:GameObject;
    private entries:any = {};
    private collectedYarnBalls:number;
    currentEntry:ProgressEntry;
    public static BASE_MAP_URL:string = "assets/story/";
    jsonLoadedCallback:(jsonData) => void;
    constructor(engine:TurbulenzEngine, filename:string)
    {
        this.collectedYarnBalls = 0;
        this.entries = {};
        this.currentEntry = {
            stateType : "null",
            map : "null",
            nextName : "null"
        };
        this.jsonLoadedCallback = (jsonData) => {
            if (jsonData) {
                var data = JSON.parse(jsonData);
                for (var name in data) {
                    var obj:any = data[name];
                    if (obj.hasOwnProperty("stateType") && obj.hasOwnProperty("map")
                        && obj.hasOwnProperty("nextName"))
                    {
                        var entry:ProgressEntry = {
                            stateType : obj.stateType,
                            map : obj.map,
                            nextName : obj.nextName
                        };
                        this.entries[name] = entry;
                    } else
                    {
                        console.log("entry is malformed" + obj);
                    }
                }
            }
            this.currentEntry = this.entries["start"];
        };
        engine.request(Progression.BASE_MAP_URL + filename + ".json", this.jsonLoadedCallback);
    }

    setGameObject(game:GameObject):void
    {
        this.game = game;
    }

    addYarnBall():void
    {
        this.collectedYarnBalls++;
    }

    totalYarnBalls():number
    {
        return this.collectedYarnBalls;
    }

    getNewCurrentState()
    {
        if (this.game == null)
        {
            console.log("progression game variable not set");
            return null;
        }
        if (this.currentEntry.stateType in window)
        {
            return new window[this.currentEntry.stateType](
                this.game,
                this.currentEntry.map
            )
        } else
        {
            console.log("invalid statetype" + this.currentEntry.stateType);
            return null;
        }
    }

    getNextState()
    {
        console.log("let's progress to the next state");
        var nextName = this.currentEntry["nextName"];
        if (!(nextName in this.entries))
        {
            console.log(nextName + " not found in entries");
        } else
        {
            this.currentEntry = this.entries[nextName];
        }
        return this.getNewCurrentState();
    }

    resetToStartState()
    {
        this.currentEntry = this.entries["start"];
        return this.getNewCurrentState();
    }
}