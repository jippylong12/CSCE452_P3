//data structure to pass info from server<->client
//includes: angles for all 3 links, whether client is master or slave (boolean)
//serverid, and whether to delay action by 2 seconds (boolean)
var serverPacket = function(ang1, ang2, ang3, delayB, serverID, masterB){
    this.ang1 = ang1;
    this.ang2 = ang2;
    this.ang3 = ang3;
    this.delayB = delayB;
    this.serverID = serverID;
    this.masterB = masterB;
}

module.exports = serverPacket;