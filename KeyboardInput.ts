/**
 * Created by martelly on 4/14/2014.
 */
class KeyboardInput
{
    inputDev:InputDevice;
    keys:any;
    private reverseMapping:any;
    constructor(inputDevice:InputDevice)
    {
        this.inputDev = inputDevice;
        this.reverseMapping = {};
        for (var item in inputDevice.keyCodes)
        {
            this.reverseMapping[inputDevice.keyCodes[item]] = item;
        }
        this.keys = {};

        var that = this;
        inputDevice.addEventListener("keydown", function(keycode) {
            that.keys[that.reverseMapping[keycode]] = true;
        });

        inputDevice.addEventListener("keyup", function(keycode) {
            that.keys[that.reverseMapping[keycode]] = false;
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
}