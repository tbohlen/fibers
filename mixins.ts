/**
 * Created by ethanis on 4/3/14.
 */

// From: https://typescript.codeplex.com/wikipage?title=Mixins%20in%20TypeScript
////////////////////////////////////////
// In your runtime library somewhere
////////////////////////////////////////

module Mixins
{
    export function applyMixins(derivedCtor: any, baseCtors: any[]) {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            })
        });
    }

    // Example of using mixins...

    // Disposable Mixin
    class Disposable {
        isDisposed:boolean;

        dispose() {
            this.isDisposed = true;
        }

    }

    // Activatable Mixin
    class Activatable {
        isActive:boolean;

        activate() {
            this.isActive = true;
        }

        deactivate() {
            this.isActive = false;
        }
    }

    class SmartObject implements Disposable, Activatable {
        constructor() {
            setInterval(() => console.log(this.isActive + " : " + this.isDisposed), 500);
        }

        interact() {
            this.activate();
        }

        // Disposable
        isDisposed:boolean = false;
        dispose:() => void;
        // Activatable
        isActive:boolean = false;
        activate:() => void;
        deactivate:() => void;
    }

    export function mixinExample()
    {
        console.log("Running mixin example.");
        applyMixins(SmartObject, [Disposable, Activatable]);
        var smartObj = new SmartObject();
        setTimeout(() => smartObj.interact(), 1000);
    }
}