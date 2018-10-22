import React, {Component} from "react";
import PubSub from "pubsub-js";
import GameStart from "./GameStart";
import GameBoard from "./GameBoard";

class Game extends Component {
    state = {gameStart: false, isFirst: false, match: null, enemy: "", bet: 0};

    componentDidMount = async () => {
        this.pubsub_match = PubSub.subscribe("match", function (topic, message) {
            this.setState({
                gameStart: true,
                isFirst: message.isFirst,
                match: message.match,
                enemy: message.enemy,
                bet: message.bet
            });
        }.bind(this));
        this.pubsub_reset = PubSub.subscribe("reset", function (topic, message) {
            this.setState({
                gameStart: false,
                isFirst: false,
                match: null,
                enemy: "",
                bet: 0
            });
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_match);
        PubSub.unsubscribe(this.pubsub_reset);
    };

    render() {
        return (
            <div>
                {!this.state.gameStart && <GameStart account={this.props.account} contract={this.props.contract}/>}
                {this.state.gameStart && <GameBoard isFirst={this.state.isFirst} match={this.state.match} enemy={this.state.enemy} bet={this.state.bet} account={this.props.account} contract={this.props.contract}/>}
            </div>
        );
    }
}

export default Game;
