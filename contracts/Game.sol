pragma solidity ^0.4.24;

contract Game {
    struct Player{
        address addr;
        string name;
        uint coins;
    }

    struct GamePlay {
        uint[15][15] grids;
        Step[] steps;
        address player1;
        address player2;
        uint bet;
    }

    struct Step {
        address player;
        uint i;
        uint j;
    }

    address[] playerAddresses;
    mapping(address => Player) players;
    mapping(address => GamePlay) playingPlays;
    address[] waiting;
    mapping(address => GamePlay) waitingPlays;

    function signup(string name) public returns(bool) {
        if(isSignedUp()){
            return false;
        }
        players[msg.sender] = Player(msg.sender, name, 100);
        playerAddresses.push(msg.sender);
        return true;
    }

    function isSignedUp() constant public returns(bool) {
        for(uint i = 0; i < playerAddresses.length; i++){
            if(playerAddresses[i] == msg.sender){
                return true;
            }
        }
        return false;
    }

    function getName() constant public returns(string){
        assert(isSignedUp());
        return players[msg.sender].name;
    }

    function getCoins() constant public returns(uint){
        assert(isSignedUp());
        return players[msg.sender].coins;
    }

    event StartGame(address addr, string name, bool isFirst);
    function startGame(uint bet) public {
        require(isSignedUp());
        uint index = 0;
        bool found = false;
        for(uint i = 0; i < waiting.length; i++){
            if (waiting[i] != 0 && waitingPlays[waiting[i]].bet == bet){
                index = i;
                found = true;
                break;
            }
        }
        if(found){
            address addr = waiting[index];
            waitingPlays[addr].player2 = msg.sender;
            playingPlays[addr] = waitingPlays[addr];
            delete waitingPlays[addr];
            delete waiting[index];
            emit StartGame(addr, players[playingPlays[addr].player1].name, false);
        }else{
            index = 0;
            found = false;
            for(uint j = 0; j < waiting.length; j++){
                if (waiting[j] == 0){
                    waiting[j] = msg.sender;
                    index = j;
                    found = true;
                    break;
                }
            }
            if (!found){
                index = waiting.push(msg.sender) - 1;
            }
            waitingPlays[msg.sender].player1 = msg.sender;
            waitingPlays[msg.sender].bet = bet;
            emit StartGame(msg.sender, "", true);
        }
    }

    function checkConnection() constant public returns(string){
        require(isSignedUp());
        if(playingPlays[msg.sender].player2 != 0){
            return players[playingPlays[msg.sender].player2].name;
        }else{
            return "";
        }
    }
}
