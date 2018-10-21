import React, {Component} from "react";
import PubSub from "pubsub-js";
import Map from "./Map";

class Game extends Component {

    // state = {hasLogin: false, name: "", hoverExit: false, coins: 0};
    //
    // componentDidMount = async () => {
    //     this.pubsub_coins = PubSub.subscribe("coins", function (topic, message) {
    //         this.setState({
    //             coins: message
    //         });
    //     }.bind(this));
    // };
    //
    // componentWillUnmount = async () => {
    //     PubSub.unsubscribe(this.pubsub_coins);
    // };

    render() {
        return (
            <Map/>
        );
    }
}

export default Game;
