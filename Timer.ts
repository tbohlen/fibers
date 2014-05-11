/**
 * Created by martelly on 5/5/2014.
 */

class Timer
{
    private sequences:Sequence[];
    fps:number;
    constructor(fps:number)
    {
        this.fps = fps;
        this.sequences = []
    }

    addSequence(sequence:Sequence):void
    {
        this.sequences[sequence.name] = sequence;
    }

    removeSequence(sequence:Sequence):void
    {
        delete this.sequences[sequence.name];
    }

    update()
    {
        for (var key in this.sequences)
        {
            this.sequences[key].nextFrame();
        }
    }
}

class Sequence
{
    game:GameObject;
    actions:SequenceAction[];
    name:string;
    currentIndex:number;
    constructor(game:GameObject, name:string, actions:SequenceAction[])
    {
        this.name  = name;
        this.game = game;
        this.actions = actions;
        this.currentIndex = 0;
    }

    static makeSequence(game:GameObject, name:string, actions:SequenceAction[]):void
    {
        var seq:Sequence = new Sequence(game, name, actions);
        game.timer.addSequence(seq);
    }

    nextFrame():void
    {
        if (this.currentIndex >= this.actions.length)
        {
            this.game.timer.removeSequence(this);
        } else
        {
            // run the current action
            this.actions[this.currentIndex].nextFrame();
            // check if it's time to move on to next action
            if (this.actions[this.currentIndex].isComplete())
            {
                console.log("Next action index");
                this.currentIndex += 1;
            }
        }
    }
}

/**
 *
 */
class SequenceAction
{
    action:Function;
    currentFrame:number;
    totalFrameCount:number;
    private completed:boolean;
    constructor(game:GameObject, delay:number, action:Function) {
        this.action = action;
        this.currentFrame = 0;
        this.totalFrameCount = delay*game.timer.fps;
        this.completed = false;
    }

    isComplete():boolean
    {
        return this.completed;
    }

    nextFrame():void {
        if (!this.completed && this.currentFrame > this.totalFrameCount)
        {
            this.completed = true;
            this.action();
        }
        this.currentFrame += 1;
    }
}