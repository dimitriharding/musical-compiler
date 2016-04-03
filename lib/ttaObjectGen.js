/**
 * @author Andre Hutchinson
 */
var http = require('http');
var fs = require( 'fs' );
var exec = require('child_process').exec;
var path = require('path');
//var Player = require('player');

function ObjGen(lyrics, service){
  //cmd = 'ttsmp3 '+"test"+' -o ObjGen_pt.mp3 -l en -g ml';
  var tmpObj = "";
  for(var o = 0; o < lyrics.length; o++){
    tmpObj += lyrics[o];
  }
  cmd = 'ttsmp3 "'+tmpObj+'" -o ' +path.resolve('./out','mp3','ObjGen.mp3')+ ' -l en -g ml';
  exec(cmd, function(error, stdout, stderr) {
    // var player = new Player(path.resolve('./out','mp3','ObjGen.mp3'))
    // player.play();
    // console.log(stdout);
    // console.log(error);
    // console.log(stderr);
  });
  console.log("ObjGen created");
  /*for(var i = 0; i < lyrics.length; i++){
    cmd = 'ttsmp3 "'+lyrics[i]+'" -o ObjGen_pt'+i+'.mp3 -l en -g ml';
    console.log(lyrics[i]);
    //cmd = 'ttsmp3 '+data+' -o ObjGen.mp3 -l en -g ml';
    exec(cmd, function(error, stdout, stderr) {
      console.log(stdout);
      console.log(error);
      console.log(stderr);
      //fs.writeFile('./out/ObjGen.mp3', stdout, function(err) {
        //if(err) {
          //  return console.log(err);
      //  }
      //})
    });
  }*/
}

module.exports = ObjGen;
