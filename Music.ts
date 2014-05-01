/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>

class Music
{
    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject):void
    {
        var bgMusic:Sound = game.soundDevice.createSound({
            src: "assets/" + obj.properties.trackname,
            uncompress: false,
            onload: function (soundData) {
                game.bgMusicSource.looping = obj.properties.isLooping == "true";
                game.bgMusicSource.play(soundData);
            }
        });
    }
}