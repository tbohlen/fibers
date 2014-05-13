/**
 * Created by ethanis on 5/8/14.
 * We load all of the game's sfx up front
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
    jumpSFX:SFXData;
    landSFX:SFXData;
    knitUpSFX:SFXData;
    knitDownSFX:SFXData;
    collectYarnSFX:SFXData;
    noKnitSFX:SFXData;

    // the currently-playing sfx
    currentSFX:SFXData;

    game:GameObject;

    constructor(game:GameObject)
    {
        this.game = game;

        this.jumpSFX= new SFXData("jump.wav", game);
        this.landSFX = new SFXData("land.wav", game);
        this.knitUpSFX = new SFXData("knit3.mp3", game);
        this.knitDownSFX = new SFXData("knit2.mp3", game);
        this.collectYarnSFX = new SFXData("yarn3.wav", game);
        this.noKnitSFX = new SFXData("noknit.wav", game);
    }


    setCurrentFX(sound:SFXData, shouldRepeat:boolean = false)
    {
        var data:Sound = sound.soundData;
        if (data)
        {
            if (this.currentSFX != sound || !this.game.sfxSource.playing || shouldRepeat){
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