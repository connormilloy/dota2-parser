//################################
//# IMPORT REQUIRED MODULES..
//################################
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, info} = require('./data/config.json');
const buildCanvas = require('./canvas');
const players = require('./players')
const users = require('./data/users.json');
const fs = require('fs');
require('dotenv').config();

client.login(process.env.DISCORD);

client.once('ready', () => {
    console.log(`${info.name} (v${info.version}) loaded..`)
})

client.on('message', async message => {
    //check to see if there's anything after the initial command, turn it into an arr containing the arguments
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();


    if(command==="recent"){

        if(!args.length){ //we know that this means they want their own profile
            let searchPlayerID = null; //initialise the ID as null, it'll change if we find a matching ID

            //iterate over the users file and try to match the search ID to an account ID
            for(let key in users){
                if(users[key].discordID === message.author.id){
                    searchPlayerID = users[key].accountid;
                }
            }

            //if we don't find one..
            if(searchPlayerID){
                let result = await players.getPlayers(searchPlayerID);
                if(result === "n/a"){
                    message.channel.send("Couldn't access your profile data, you probably have the feature disabled in DOTA.");
                } else { 
            //if we do find one..
                    let matchInfo = await players.getMatchData();
                    const attachment = await buildCanvas.buildCanvas(result, matchInfo)
                    message.channel.send(attachment);
                }
            } else {
                message.channel.send("Your account ID isn't on the whitelist, message Connor to fix that.")
            }
        } else {
            const user = message.mentions.users.first();    //TODO: fix this exercise in redundant code
            let searchPlayerID = null;                      //executes if we found a mention as a command argument

            for(let key in users){
                if(users[key].discordID === user.id){
                    searchPlayerID = users[key].accountid;
                }
            }
            if(searchPlayerID){
                let result = await players.getPlayers(searchPlayerID);
                if(result === "n/a"){
                    message.channel.send("Couldn't access that profile, it's likely set to private on DOTA.");
                } else {
                    console.log(result);
                    let matchInfo = await players.getMatchData();
                    const attachment = await buildCanvas.buildCanvas(result, matchInfo)
                    message.channel.send(attachment);
                }
            } else {
                message.channel.send("That account ID isn't on the whitelist, message Connor to fix that.")
            }
        }
    }
})