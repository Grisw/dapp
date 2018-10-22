pragma solidity ^0.4.24;

contract Game {
    struct Player{
        address addr;
        string name;
        uint coins;
    }

    struct GamePlay {
        address[15][15] grids;
        Step[] steps;
        address player1;
        address player2;
        uint bet;
        address turn;
        address winner;
    }

    struct Step {
        address player;
        uint i;
        uint j;
    }

    address[] playerAddresses;
    mapping(address => Player) players;
    mapping(address => GamePlay) playingPlays;
    mapping(address => address) playingPlaysAddr;
    address[] waiting;
    mapping(address => GamePlay) waitingPlays;
    mapping(address => Step) lastStep;

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
        require(players[msg.sender].coins >= bet);
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
            playingPlaysAddr[msg.sender] = addr;
            playingPlaysAddr[addr] = addr;
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
            waitingPlays[msg.sender].turn = msg.sender;
            emit StartGame(msg.sender, "", true);
        }
    }

    function checkConnection() constant public returns(string){
        require(isSignedUp());
        if(playingPlays[playingPlaysAddr[msg.sender]].player2 != 0){
            if (msg.sender == playingPlays[playingPlaysAddr[msg.sender]].player2){
                return players[playingPlays[playingPlaysAddr[msg.sender]].player1].name;
            }else{
                return players[playingPlays[playingPlaysAddr[msg.sender]].player2].name;
            }
        }else{
            return "";
        }
    }

    function step(uint i, uint j) public {
        address addr = playingPlaysAddr[msg.sender];
        require(isSignedUp());
        require(playingPlays[addr].turn == msg.sender);
        require(playingPlays[addr].grids[i][j] == 0);
        playingPlays[addr].grids[i][j] = msg.sender;
        playingPlays[addr].steps.push(Step(msg.sender, i, j));
        if (checkChess(i, j)){
            playingPlays[addr].winner = msg.sender;
            win(playingPlays[addr].bet, addr);
        }
        if (playingPlays[addr].player1 == msg.sender){
            playingPlays[addr].turn = playingPlays[addr].player2;
        }else{
            playingPlays[addr].turn = playingPlays[addr].player1;
        }
    }

    event Win();
    function win(uint bet, address addr) private {
        players[msg.sender].coins += bet;
        if (playingPlays[addr].player1 == msg.sender){
            players[playingPlays[addr].player2].coins -= bet;
            delete playingPlaysAddr[playingPlays[addr].player2];
            lastStep[playingPlays[addr].player2] = playingPlays[addr].steps[playingPlays[addr].steps.length - 1];
        }else{
            players[playingPlays[addr].player1].coins -= bet;
            delete playingPlaysAddr[playingPlays[addr].player1];
            lastStep[playingPlays[addr].player1] = playingPlays[addr].steps[playingPlays[addr].steps.length - 1];
        }
        delete playingPlaysAddr[msg.sender];
        emit Win();
    }

    function checkChess(uint i, uint j) constant private returns(bool) {
        address addr = playingPlaysAddr[msg.sender];
        address[15][15] grids = playingPlays[addr].grids;

        uint count = 1;
        for(uint s = 1; s <= 4; s++){
            if (i >= s && j >= s){
                if (grids[i - s][j - s] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        for(s = 1; s <= 4; s++){
            if (i + s < 15 && j + s < 15){
                if (grids[i + s][j + s] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        if (count >= 5){
            return true;
        }

        count = 1;
        for(s = 1; s <= 4; s++){
            if (i >= s){
                if (grids[i - s][j] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        for(s = 1; s <= 4; s++){
            if (i + s < 15){
                if (grids[i + s][j] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        if (count >= 5){
            return true;
        }

        count = 1;
        for(s = 1; s <= 4; s++){
            if (i >= s &&  j + s < 15){
                if (grids[i - s][j + s] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        for(s = 1; s <= 4; s++){
            if (i + s < 15 && j >= s){
                if (grids[i + s][j - s] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        if (count >= 5){
            return true;
        }

        count = 1;
        for(s = 1; s <= 4; s++){
            if (j >= s){
                if (grids[i][j - s] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        for(s = 1; s <= 4; s++){
            if (j + s < 15){
                if (grids[i][j + s] == msg.sender){
                    count++;
                }else{
                    break;
                }
            }else{
                break;
            }
        }
        if (count >= 5){
            return true;
        }

        return false;
    }

    function checkStatus() constant public returns(bool, bool, uint, uint){
        require(isSignedUp());
        address addr = playingPlaysAddr[msg.sender];
        uint i = 0;
        uint j = 0;
        if (addr == 0){
            i = lastStep[msg.sender].i;
            j = lastStep[msg.sender].j;
            return (true, true, i, j);
        }else{
            bool isTurn = playingPlays[addr].turn == msg.sender;
            bool isLost = playingPlays[addr].winner != 0;
            if (playingPlays[addr].steps.length > 0){
                Step s = playingPlays[addr].steps[playingPlays[addr].steps.length - 1];
                i = s.i;
                j = s.j;
            }
            return (isTurn, isLost, i, j);
        }
    }
}
