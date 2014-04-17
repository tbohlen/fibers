/**
 * Created by martelly on 4/14/2014.
 */
class KeyboardInput
{
    inputDev:InputDevice;
    keys:any;
    private reverseMapping:any;
    private recentlyPressed:any;
    private recentlyReleased:any;
    constructor(inputDevice:InputDevice)
    {
        this.inputDev = inputDevice;
        this.reverseMapping = {};
        this.recentlyPressed = {};
        this.recentlyReleased = {};
        for (var item in inputDevice.keyCodes)
        {
            this.reverseMapping[inputDevice.keyCodes[item]] = item;
        }
        this.keys = {};

        var that = this;
        inputDevice.addEventListener("keydown", function(keycode) {
            that.keys[that.reverseMapping[keycode]] = true;
            that.recentlyPressed[that.reverseMapping[keycode]] = true;
            that.recentlyReleased[that.reverseMapping[keycode]] = false;
        });

        inputDevice.addEventListener("keyup", function(keycode) {
            that.keys[that.reverseMapping[keycode]] = false;
            that.recentlyPressed[that.reverseMapping[keycode]] = false;
            that.recentlyReleased[that.reverseMapping[keycode]] = true;
        });
    }

    keyPressed(key:string):boolean
    {
        if (key in this.keys)
        {
            return this.keys[key];
        }
        return false;
    }

    justPressed(key:string):boolean
    {
        if (key in this.recentlyPressed) {
            return this.recentlyPressed[key];
        }
        return false;
    }

    justReleased(key:string):boolean
    {
        if (key in this.recentlyReleased) {
            return this.recentlyReleased[key];
        }
        return false;
    }

    update():void
    {
        this.recentlyPressed = {};
        this.recentlyReleased = {};
    }
}