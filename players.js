//################################
//# IMPORT REQUIRED MODULES..
//################################
const heroes = require('./data/heroes.json');
const items = require('./data/items.json');
require('dotenv').config();
const fetch = require('node-fetch');
const convertID = require('steam-id-convertor');

let players; //holy global variable batman

async function getPlayers(user_id){
    let playerData = [];
    const matchID = await getMatchID(user_id);

    if(matchID === "n/a"){
        return matchID;
    }
    players = await getMatchInfo(matchID);

    //iterate over the json result, item_0-item_6 are statically named and not easily referenceable keys
    for(let key in players.result.players){
        const heroName = getHeroName(players.result.players[key].hero_id);
        let itemArr = [];
        let playerName;
        itemArr.push(getItemInfo(players.result.players[key].item_0));
        itemArr.push(getItemInfo(players.result.players[key].item_1));
        itemArr.push(getItemInfo(players.result.players[key].item_2));
        itemArr.push(getItemInfo(players.result.players[key].item_3));
        itemArr.push(getItemInfo(players.result.players[key].item_4));
        itemArr.push(getItemInfo(players.result.players[key].item_5));
        
        //handler code for a slot with no item inside it
        for(let i = 0; i < itemArr.length; i++){
            if(itemArr[i] === undefined){
                itemArr[i] = "n-a";
            }
        }
        const search = players.result.players[key].account_id;

        //the account id will be 4294967295 if the profile is private.
        //we still want to render something so we'll just have it render anonymous for now.
        if(search === "4294967295"){
            playerName = "Anonymous";
        } else {
            playerName = await matchPlayerName(search);
        }
    
        //creating the player object which has each player's info
        const player = {
            name: playerName,
            hero: heroName,
            level: players.result.players[key].level,
            kills: players.result.players[key].kills,
            deaths: players.result.players[key].deaths,
            assists: players.result.players[key].assists,
            last_hits: players.result.players[key].last_hits,
            denies: players.result.players[key].denies,
            items: itemArr
        }
    
        playerData.push(player);
    }
        return playerData;
    }

async function getMatchData(){
    const matchData = {
        radiant_win: players.result.radiant_win,
        duration: players.result.duration
    }
    return matchData;
}

//match the hero ID to a name, we use this to render the hero icon
function getHeroName(id){
    for(let key in heroes){
        if(heroes[key].id === id){
            return heroes[key].heroName;
        }
    }
}

//match the item ID to a name, we use this to render the item icon
function getItemInfo(item_id){
    for(let key in items){
        if(items[key].id === item_id){
            return `${items[key].itemName}`;
        }
    }
}

//match player's ID to the player's nickname, we need to make API calls to the regular steam API for this, querying their id64
//CAN'T GET THAT WITHOUT A HELPER FUNCTION SINCE DOTA ONLY USES ID32???
async function matchPlayerName(id){
    const apiKey = process.env.STEAM; //this is here for some reason even though it's not consistent with any other instance of api keys
    const id64 = convertID.to64(id); //doing the thing
    try{
        const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${id64}`);
        if(response.ok){
            const res = await response.json();
            if(res.response.players[0]){
                return res.response.players[0].personaname;
            } else {
                return "Anonymous"; //holy redundant code, batman! pretty sure :44 does this but if we remove either it breaks
            }
        } else {
            console.log("Error");
        }
    } catch (e) {
        throw e;
    }
}

//getting the match ID from the account ID, we return only the most recent result and store the ID of that match to use as a query later
async function getMatchID(id){
    const url = `https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=${process.env.STEAM}&account_id=${id}&matches_requested=1`

    try{
        const res = await fetch(url);
        if(res.ok){
            const jsonRes = await res.json();
            if(jsonRes.result.status === 15){
                return "n/a";
            } else {
                return jsonRes.result.matches[0].match_id;
            }
        }
    } catch (e){
        throw e;
    }
}

//getting our match info object from the ID we got in the previous method
async function getMatchInfo(matchID){ 
    try{
        const url = `http://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1/?match_id=${matchID}&key=${process.env.STEAM}`;
        const res = await fetch(url);
        if(res.ok){
            const jsonRes = await res.json();
            return jsonRes;
        }
    } catch (e) {
        throw e;
    }
}

exports.getPlayers = getPlayers;
exports.getMatchData = getMatchData;