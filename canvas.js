//################################
//# IMPORT REQUIRED MODULES..
//################################
const Canvas = require('canvas');
const Discord = require('discord.js')
const fs = require('fs');
const request = require('request');

async function buildCanvas(result, matchInfo){

    //convert the match duration into a time format..
    const time = new Date(null);
    time.setSeconds(matchInfo.duration);
    const matchDuration = time.toISOString().substr(11, 8);

    //create our canvas with oddly specific dimensions..
    const canvas = Canvas.createCanvas(890, 575);
    const ctx = canvas.getContext('2d');
    const bg = await Canvas.loadImage("./images/bg5.jpg"); //5 iterations of that background image :)

    //set initial x and y values, we use these for cascading the images
    let x = 510;
    let y = 75;


    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.fillText('K / D / A', 350, 50);
    ctx.fillText('LH / DN', 450, 50)
    ctx.fillText('ITEMS', 665, 50)

    //we iterate over the entire result object and use each field once per line on the scoreboard output
    for(let key in result){
        let heroPath = await Canvas.loadImage(`./images/heroes/${result[key].hero}.jpg`); //get the hero icon
        ctx.drawImage(heroPath, 80, y, 55, 33); //draw the icon
        ctx.font = applyText(canvas, result[key].name);
        ctx.fillText(`${result[key].name}`, 220, y+20)
        ctx.font = '14px sans-serif'
        ctx.fillText(`${result[key].kills} / ${result[key].deaths} / ${result[key].assists}`, 350, y+22)
        ctx.fillText(`${result[key].last_hits} / ${result[key].denies}`, 450, y+22)
        ctx.fillText(`${result[key].level}`, 55, y+20)

        //RENDER PLAYER INVENTORY
        for(let itemID in result[key].items){
            for(let i = 0; i < 6; i++){
                let itemImage = await Canvas.loadImage(`./images/items/${result[key].items[i]}.jpg`)
                ctx.drawImage(itemImage, x, y, 50, 33);
                x+=55;
            }
            x=510;
        }

        y+=35;

        //workaround code to split the heroes into 5v5
        //TODO: FIX THIS LATER YOU FOOL
        if(y === 250){
            y+=25;
        }
    }

    //change our text settings to be nice and big so we can display the winner of the match
    ctx.font = '42px sans-serif'

    if(matchInfo.radiant_win === true){
        ctx.fillStyle = "#3895D3";
        ctx.fillText(`Radiant Victory @ ${matchDuration}`, canvas.width/2, 535)
    } else {
        ctx.fillStyle = "#8E1600"
        ctx.fillText(`Dire Victory @ ${matchDuration}`, canvas.width/2, 535)
    }

    //buffer the image and then return the monstrosity we've built
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'image.png');
    return attachment;
}

    //some kind of helper function for dynamic text size, I don't think it works but I'm afraid to take it away
const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');
    let fontSize = 20;
    do {
        ctx.font = `${fontSize -= 10}px sans-serif`;
    } while(ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
};

exports.buildCanvas = buildCanvas;