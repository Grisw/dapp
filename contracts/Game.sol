pragma solidity ^0.4.24;

contract Game {
    struct Player{
        address addr;
        string name;
        uint coins;
        uint hp;
        uint level;
        uint exp;
        uint atk;
        uint def;
        Map map;
    }

    struct Map {
        Block[][] map;
        Pos playerPos;
    }

    struct Block {
        string sprite;
        string sprite_1;
        bool focus;
    }

    struct Pos{
        uint i;
        uint j;
    }

    address[] playerAddresses;
    mapping(address => Player) players;

    function signup(string name) public returns(bool) {
        if(isSignedUp()){
            return false;
        }
        players[msg.sender] = Player(msg.sender, name, 0, 100, 1, 0, 5, 0);
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

    function getStatus() constant public returns(string, uint, uint, uint, uint, uint, uint){
        assert(isSignedUp());
        return (players[msg.sender].name, players[msg.sender].coins, players[msg.sender].hp, players[msg.sender].level, players[msg.sender].exp, players[msg.sender].atk, players[msg.sender].def);
    }
}
