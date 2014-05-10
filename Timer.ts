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
        this.game.timer.addSequence(this);
    }

    nextFrame():void
    {
        if (this.currentIndex > this.actions.length)
        {
            this.game.timer.removeSequence(this);
        } else
        {
            // check if it's time to move on to next action
            if (this.actions[this.currentIndex].isComplete())
            {
                this.currentIndex += 1;
            }
            // run the current action
            this.actions[this.currentIndex].nextFrame();
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
    constructor(game:GameObject, delaySeconds:number, action:Function) {
        this.action = action;
        this.currentFrame = 0;
        this.totalFrameCount = delaySeconds/game.timer.fps;
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