/**
 * Created by ethanis on 5/8/14.
 */
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="interfaces.ts" />

class SFXData
{
    soundData:Sound;

    constructor(public fname: string, game:GameObject){
        game.soundDevice.createSound({
            src: "assets/sfx/" + fname,
            uncompress: false,
            onload: (soundData) => {
                if (soundData){
                    this.soundData = soundData;
                } else {
                    console.log("NO SOUND DATA...");
                }
            }
        });
    }
}

class SFX
{
    walkSFX:SFXData;
    jumpSFX:SFXData;
    landSFX:SFXData;
    knitUpSFX:SFXData;
    knitDownSFX:SFXData;
    collectYarnSFX:SFXData;

    currentSFX:SFXData;

    game:GameObject;

    constructor(game:GameObject)
    {
        this.game = game;

        this.walkSFX = new SFXData("jump.wav", game);
        this.jumpSFX= new SFXData("jump.wav", game);
        this.landSFX = new SFXData("jump.wav", game);
        this.knitUpSFX = new SFXData("sewing_machine.wav", game);
        this.knitDownSFX = new SFXData("sewing_machine.wav", game);
        this.collectYarnSFX = new SFXData("sewing_machine.wav", game);
    }

    setCurrentFX(sound:SFXData)
    {
        var data:Sound = sound.soundData;
        if (data)
        {
            if (this.currentSFX != sound || !this.game.sfxSource.playing){
                this.currentSFX = sound;
                this.game.sfxSource.rewind();
                this.game.sfxSource.play(data);
            }
            if (this.currentSFX == sound && this.game.sfxSource.paused)
            {
                this.game.sfxSource.resume();
            }
        }
    }
}