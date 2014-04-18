/**
 * Created by martelly on 4/14/2014.
 */
class InpDevWrapper
{
    inputDev:InputDevice;
    keys:any;
    mouse:any;

    private reverseMapping:any;
    private recentlyPressed:any;
    private recentlyReleased:any;
    constructor(inputDevice:InputDevice)
    {
        this.inputDev = inputDevice;
        this.reverseMapping = {};
        this.recentlyPressed = {};
        this.recentlyReleased = {};
        this.mouse = {x: 0,
            y:0,
            pressed : false,
            recentlyPressed : false,
            recentlyReleased : false};
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

        inputDevice.addEventListener("mousedown", function(mouseCode, x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
            if (mouseCode === inputDevice.mouseCodes.BUTTON_0) {
                that.mouse.pressed = true;
                that.mouse.recentlyPressed = true;
                that.mouse.recentlyReleased = false;
            }
        });

        inputDevice.addEventListener("mouseup", function(mouseCode, x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
            if (mouseCode === inputDevice.mouseCodes.BUTTON_0) {
                that.mouse.pressed = false;
                that.mouse.recentlyPressed = false;
                that.mouse.recentlyReleased = true;
            }
        });

        inputDevice.addEventListener("mouseover", function(x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
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

    mousePressed():boolean
    {
        return this.mouse.pressed;
    }

    mouseX():number
    {
        return this.mouse.x;
    }

    mouseY():number
    {
        return this.mouse.y;
    }

    mousePosition():number[]
    {
        return [this.mouseX(), this.mouseY()];
    }

    mouseJustPressed():boolean
    {
        return this.mouse.justPressed;
    }

    mouseJustReleased():boolean
    {
        return this.mouse.justReleased;
    }

    update():void
    {
        this.recentlyPressed = {};
        this.recentlyReleased = {};
    }
}