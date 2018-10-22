import React, {Component} from "react";
import PubSub from "pubsub-js";
import $ from "jquery"
import toastr from "toastr/build/toastr.min"
import "toastr/build/toastr.css"

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
            this.toastr_enemyTurn();
            this.checkStatus(this.props.account, this.props.contract);
        }else{
            this.toastr_myTurn();
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
        this.toastr_enemyTurn();
        this.checkStatus(account, contract);
    };

    checkStatus = async (account, contract) => {
        while (true){
            const result = await contract.checkStatus({from: account});
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
        this.toastr_myTurn();
    };

    win = async () => {
        const {account, contract} = this.props;
        const coins = await contract.getCoins({from: account});
        PubSub.publish("coins", coins);
        this.toastr_win();
        setTimeout(()=>{PubSub.publish("reset");}, 3000);
    };

    lost = async () => {
        const {account, contract} = this.props;
        const coins = await contract.getCoins({from: account});
        PubSub.publish("coins", coins);
        this.toastr_lost();
        setTimeout(()=>{PubSub.publish("reset");}, 3000);
    };

    toastr_enemyTurn = () => {
        toastr.options = {
            closeButton: false,
            debug: false,
            progressBar: false,
            positionClass: "toast-top-right",
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "2000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
        toastr.warning("对手的回合...");
    };

    toastr_myTurn = () => {
        toastr.options = {
            closeButton: false,
            debug: false,
            progressBar: false,
            positionClass: "toast-top-right",
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "2000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
        toastr.info("你的回合！");
    };

    toastr_win = () => {
        toastr.options = {
            closeButton: false,
            debug: false,
            progressBar: false,
            positionClass: "toast-top-right",
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "2000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
        toastr.success("你的胜利！得到$ " + this.props.bet + ".");
    };

    toastr_lost = () => {
        toastr.options = {
            closeButton: false,
            debug: false,
            progressBar: false,
            positionClass: "toast-top-right",
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "2000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
        toastr.error("你输了...失去$ " + this.props.bet + ".");
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
