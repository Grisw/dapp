import React, {Component} from "react";
import PubSub from "pubsub-js";
import $ from "jquery"
import sprite from "../img/gamesprites.png"

class Map extends Component {
    mapBlocks = 12;
    spriteBlockSize = 32;
    spriteMapping = {
        "wall": {x: this.spriteBlockSize, y: 3 * this.spriteBlockSize},
        "ground": {x: 0, y: 4 * this.spriteBlockSize},
        "rock": {x: 2 * this.spriteBlockSize, y: 3 * this.spriteBlockSize},
        "exit": {x: 4 * this.spriteBlockSize, y: 2 * this.spriteBlockSize},
        "player": {x: 0, y: 0},
        "enemy": {x: 6 * this.spriteBlockSize, y: 0},
        "food": {x: 3 * this.spriteBlockSize, y: 2 * this.spriteBlockSize}
    };

    componentDidMount = async () => {
        this.canvas = $("#gamemap")[0];
        this.ctx = this.canvas.getContext("2d");
        this.size = this.canvas.width;
        this.canvas.height = this.size;
        this.blockSize = this.size / this.mapBlocks;

        this.genMap();

        this.sprite = new Image();
        this.sprite.src = sprite;
        this.sprite.onload = this.drawMap;

        this.canvas.addEventListener("mousemove", this.mousemove, false);
        this.canvas.addEventListener("mouseup", this.mouseup, false);
        // this.pubsub_coins = PubSub.subscribe("coins", function (topic, message) {
        //     this.setState({
        //         coins: message
        //     });
        // }.bind(this));
    };

    genMap = () => {
        this.map = [];

        for(let i = 0; i < this.mapBlocks; i++){
            let row = [];
            for(let j = 0; j < this.mapBlocks; j++){
                row.push({x: j * this.blockSize, y: i * this.blockSize, sprite: "ground"});
            }
            this.map.push(row);
        }

        // Gen Wall
        {
            for(let i = 0; i < this.mapBlocks; i++){
                this.map[i][0].sprite = "wall";
                this.map[i][this.mapBlocks - 1].sprite = "wall";
                this.map[0][i].sprite = "wall";
                this.map[this.mapBlocks - 1][i].sprite = "wall";
            }
        }

        // Gen Rock
        {
            const rockCount = Math.floor(Math.random() * 7) + 3;
            for(let i = 0; i < rockCount; i++){
                const x = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                const y = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                this.map[x][y].sprite = "rock";
            }
        }

        // Gen Exit
        {
            while(true){
                const i = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                const j = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                if(this.map[i][j].sprite === "ground"){
                    if(this.map[i + 1][j].sprite !== "ground" &&
                        this.map[i - 1][j].sprite !== "ground" &&
                        this.map[i][j + 1].sprite !== "ground" &&
                        this.map[i][j - 1].sprite !== "ground"){
                        continue;
                    }
                    this.map[i][j].sprite_1 = "exit";
                    break;
                }
            }
        }

        // Gen Player
        {
            while(true){
                const i = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                const j = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                if(this.map[i][j].sprite === "ground" && !this.map[i][j].sprite_1){
                    if(this.map[i + 1][j].sprite !== "ground" &&
                        this.map[i - 1][j].sprite !== "ground" &&
                        this.map[i][j + 1].sprite !== "ground" &&
                        this.map[i][j - 1].sprite !== "ground"){
                        continue;
                    }
                    this.map[i][j].sprite_1 = "player";
                    this.playPos = {i: i, j: j};
                    break;
                }
            }
        }

        // Gen Enemy
        {
            const enemyCount = Math.floor(Math.random() * 4) + 1;
            for(let i = 0; i < enemyCount; i++){
                while(true){
                    const i = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                    const j = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                    if(this.map[i][j].sprite === "ground" && !this.map[i][j].sprite_1){
                        this.map[i][j].sprite_1 = "enemy";
                        break;
                    }
                }
            }
        }

        // Gen Food
        {
            const foodCount = Math.floor(Math.random() * 3);
            for(let i = 0; i < foodCount; i++){
                while(true){
                    const i = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                    const j = Math.floor(Math.random() * (this.mapBlocks - 2)) + 1;
                    if(this.map[i][j].sprite === "ground" && !this.map[i][j].sprite_1){
                        this.map[i][j].sprite_1 = "food";
                        break;
                    }
                }
            }
        }
    };

    drawMap = () => {
        this.ctx.clearRect(0, 0, this.size, this.size);

        // Layer 1
        for(let i = 0; i < this.mapBlocks; i++){
            for(let j = 0; j < this.mapBlocks; j++){
                const block = this.map[i][j];
                this.ctx.drawImage(this.sprite, this.spriteMapping[block.sprite].x, this.spriteMapping[block.sprite].y, this.spriteBlockSize, this.spriteBlockSize, block.x, block.y, this.blockSize, this.blockSize);
            }
        }

        // Layer 2
        for(let i = 0; i < this.mapBlocks; i++){
            for(let j = 0; j < this.mapBlocks; j++){
                const block = this.map[i][j];
                if (block.sprite_1){
                    this.ctx.drawImage(this.sprite, this.spriteMapping[block.sprite_1].x, this.spriteMapping[block.sprite_1].y, this.spriteBlockSize, this.spriteBlockSize, block.x, block.y, this.blockSize, this.blockSize);
                }
            }
        }

        // Focus
        for(let i = 0; i < this.mapBlocks; i++){
            for(let j = 0; j < this.mapBlocks; j++){
                let block = this.map[i][j];
                if (block.focus){
                    this.ctx.strokeRect(block.x, block.y, this.blockSize, this.blockSize);
                    block.focus = false;
                }
            }
        }
    };

    mousemove = async (e) => {
        const {x, y} = this.getPointOnCanvas(this.canvas, e.pageX, e.pageY);
        const blockI = Math.floor(y / this.blockSize);
        const blockJ = Math.floor(x / this.blockSize);
        this.map[blockI][blockJ].focus = true;
        this.drawMap();
    };

    mouseup = async (e) => {
        const {x, y} = this.getPointOnCanvas(this.canvas, e.pageX, e.pageY);
        const blockI = Math.floor(y / this.blockSize);
        const blockJ = Math.floor(x / this.blockSize);

        if ((this.playPos.i + 1 === blockI && this.playPos.j === blockJ) ||
            (this.playPos.i - 1 === blockI && this.playPos.j === blockJ) ||
            (this.playPos.i === blockI && this.playPos.j + 1 === blockJ) ||
            (this.playPos.i === blockI && this.playPos.j - 1 === blockJ)){
            this.moveTo(blockI, blockJ);
        }
    };

    moveTo = (i, j) => {
        if(this.map[i][j].sprite !== "ground"){
            return;
        }
        this.map[this.playPos.i][this.playPos.j].sprite_1 = null;
        this.playPos.i = i;
        this.playPos.j = j;
        this.map[this.playPos.i][this.playPos.j].sprite_1 = "player";
        this.drawMap();
    };

    getPointOnCanvas = (canvas, x, y) => {
        const bbox =canvas.getBoundingClientRect();
        return { x: Math.round((x- bbox.left )*(canvas.width / bbox.width)),
            y: Math.round((y - bbox.top) * (canvas.height / bbox.height))};
    };

    //
    // componentWillUnmount = async () => {
    //     PubSub.unsubscribe(this.pubsub_coins);
    // };
    //
    // start = async () => {
    //
    // };

    render() {
        return (
            <div className="w-100 text-center">
                <canvas id="gamemap" className="w-75"/>
            </div>
        );
    }
}

export default Map;
