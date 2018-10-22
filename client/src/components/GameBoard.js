import React, {Component} from "react";
import PubSub from "pubsub-js";
import $ from "jquery"

class GameBoard extends Component {
    gridCount = 15;
    playerColor = ["black", "white"];
    state = {turn: false};

    constructor(props){
        super(props);
        this.isFirst = props.isFirst;
    }

    componentDidMount = async () => {
        this.gameboard = $("#gameboard")[0];
        this.gameboardCtx = this.gameboard.getContext("2d");
        this.focus = $("#focus")[0];
        this.focusCtx = this.focus.getContext("2d");
        this.chess = $("#chess")[0];
        this.chessCtx = this.chess.getContext("2d");
        this.size = this.gameboard.width;
        this.gameboard.height = this.size;
        this.focus.height = this.size;
        this.chess.height = this.size;
        this.gridSize = this.size / this.gridCount;

        this.genBoard();
        this.drawBoard();

        this.focus.addEventListener("mousemove", this.mousemove, false);
        this.focus.addEventListener("mouseup", this.mouseup, false);

        if (!this.isFirst){
            this.checkStatus(this.props.account, this.props.contract);
        }
    };

    genBoard = () => {
        this.board = [];

        for(let i = 0; i < this.gridCount; i++){
            let row = [];
            for(let j = 0; j < this.gridCount; j++){
                row.push({x: j * this.gridSize + this.gridSize / 2, y: i * this.gridSize + this.gridSize / 2});
            }
            this.board.push(row);
        }
    };

    drawBoard = () => {
        this.gameboardCtx.fillStyle = "#d5b092";
        this.gameboardCtx.fillRect(0, 0, this.size, this.size);

        // Layer 1
        for(let i = 0; i < this.gridCount; i++){
            for(let j = 0; j < this.gridCount; j++){
                let grid = this.board[i][j];

                if (i === 0){
                    this.gameboardCtx.moveTo(grid.x, grid.y);
                    this.gameboardCtx.lineTo(grid.x, grid.y + this.gridSize / 2);
                }else if (i === this.gridCount - 1){
                    this.gameboardCtx.moveTo(grid.x, grid.y);
                    this.gameboardCtx.lineTo(grid.x, grid.y - this.gridSize / 2);
                }else{
                    this.gameboardCtx.moveTo(grid.x, grid.y - this.gridSize / 2);
                    this.gameboardCtx.lineTo(grid.x, grid.y + this.gridSize / 2);
                }
                if (j === 0){
                    this.gameboardCtx.moveTo(grid.x, grid.y);
                    this.gameboardCtx.lineTo(grid.x + this.gridSize / 2, grid.y);
                }else if (j === this.gridCount - 1){
                    this.gameboardCtx.moveTo(grid.x, grid.y);
                    this.gameboardCtx.lineTo(grid.x - this.gridSize / 2, grid.y);
                }else{
                    this.gameboardCtx.moveTo(grid.x - this.gridSize / 2, grid.y);
                    this.gameboardCtx.lineTo(grid.x + this.gridSize / 2, grid.y);
                }
                this.gameboardCtx.stroke();
            }
        }

        // Layer 2
        // for(let i = 0; i < this.mapBlocks; i++){
        //     for(let j = 0; j < this.mapBlocks; j++){
        //         const block = this.map[i][j];
        //         if (block.sprite_1){
        //             this.gameboardCtx.drawImage(this.sprite, this.spriteMapping[block.sprite_1].x, this.spriteMapping[block.sprite_1].y, this.spriteBlockSize, this.spriteBlockSize, block.x, block.y, this.blockSize, this.blockSize);
        //         }
        //     }
        // }
    };

    drawFocus = (i, j) => {
        const grid = this.board[i][j];
        this.focusCtx.clearRect(0, 0, this.size, this.size);
        this.focusCtx.strokeRect(grid.x - this.gridSize / 2, grid.y - this.gridSize / 2, this.gridSize, this.gridSize);
    };

    drawChess = (i, j, player) => {
        const grid = this.board[i][j];
        this.chessCtx.beginPath();
        this.chessCtx.arc(grid.x, grid.y, this.gridSize / 2, 0, 2 * Math.PI);
        this.chessCtx.fillStyle = this.playerColor[player - 1];
        this.chessCtx.closePath();
        this.chessCtx.fill();
        this.board[i][j].chess = player;
    };

    mousemove = async (e) => {
        const {x, y} = this.getPointOnCanvas(this.gameboard, e.pageX, e.pageY);
        const blockI = this.clampNumber(Math.floor(y / this.gridSize), 0, this.gridCount - 1);
        const blockJ = this.clampNumber(Math.floor(x / this.gridSize), 0, this.gridCount - 1);
        this.drawFocus(blockI, blockJ);
    };

    mouseup = async (e) => {
        if (!this.isFirst && !this.state.turn){
            return;
        }
        this.isFirst = false;
        const {x, y} = this.getPointOnCanvas(this.chess, e.pageX, e.pageY);
        const blockI = this.clampNumber(Math.floor(y / this.gridSize), 0, this.gridCount - 1);
        const blockJ = this.clampNumber(Math.floor(x / this.gridSize), 0, this.gridCount - 1);

        if (!this.board[blockI][blockJ].chess){
            this.drawChess(blockI, blockJ, 1);
            this.move(blockI, blockJ);
        }
    };

    move = async (i, j) => {
        const {account, contract} = this.props;

        this.setState({turn: false});
        const result = await contract.step(i, j, {from: account});
        for (let i = 0; i < result.logs.length; i++) {
            let log = result.logs[i];
            if (log.event === "Win") {
                this.win();
                return;
            }
        }
        this.checkStatus(account, contract);
    };

    checkStatus = async (account, contract) => {
        while (true){
            const result = await contract.checkStatus({from: account});
            console.log(result[0]);
            if(result[0]){
                this.drawChess(result[2].toNumber(), result[3].toNumber(), 2);
                if(result[1]){
                    this.lost();
                }else{
                    this.setState({turn: true});
                }
                break;
            }
        }
    };

    win = () => {
        console.log("win");
    };

    lost = () => {
        console.log("lost");
    };

    getPointOnCanvas = (canvas, x, y) => {
        const bbox =canvas.getBoundingClientRect();
        return { x: Math.round((x- bbox.left )*(canvas.width / bbox.width)),
            y: Math.round((y - bbox.top) * (canvas.height / bbox.height))};
    };

    clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

    render() {
        return (
            <div className="w-100" style={{position: "relative"}}>
                <canvas id="gameboard" className="w-75" style={{position: "absolute", left: 0, top: 0, zIndex: 0}}/>
                <canvas id="chess" className="w-75" style={{position: "absolute", left: 0, top: 0, zIndex: 1}}/>
                <canvas id="focus" className="w-75" style={{position: "absolute", left: 0, top: 0, zIndex: 2}}/>
            </div>
        );
    }
}

export default GameBoard;
