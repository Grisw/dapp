import React, {Component} from "react";
import PubSub from "pubsub-js";

class Nav extends Component {

    state = {hasLogin: false, name: null, coins: 0, enemy: "", bet: 0};

    componentDidMount = async () => {
        this.pubsub_name = PubSub.subscribe("name", function (topic, message) {
            this.setState({
                hasLogin: true,
                name: message.name
            });
        }.bind(this));
        this.pubsub_coins = PubSub.subscribe("coins", function (topic, message) {
            this.setState({
                coins: message.toNumber()
            });
        }.bind(this));
        this.pubsub_match = PubSub.subscribe("match", function (topic, message) {
            this.setState({
                enemy: message.enemy,
                bet: message.bet
            });
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_name);
        PubSub.unsubscribe(this.pubsub_coins);
        PubSub.unsubscribe(this.pubsub_match);
    };

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand">{this.state.name || "Dungeon"}</a>

                {this.state.hasLogin && this.state.enemy &&
                <ul className="navbar-nav justify-content-end w-50 row">
                    <li className="nav-item navbar-text ml-4">
                        VS {this.state.enemy}
                    </li>
                    <li className="nav-item navbar-text ml-4">
                        Bet: {this.state.bet}
                    </li>
                </ul>
                }

                {this.state.hasLogin &&
                <ul className="navbar-nav justify-content-end w-50 row">
                    <li className="nav-item navbar-text mr-3">
                        $ {this.state.coins}
                    </li>
                </ul>
                }
            </nav>
        );
    }
}

export default Nav;
