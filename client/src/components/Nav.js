import React, {Component} from "react";
import PubSub from "pubsub-js";

class Nav extends Component {

    state = {hasLogin: false, name: null, coins: 0, hp: 0, level: 0, exp: 0, atk: 0, def: 0};

    componentDidMount = async () => {
        this.pubsub_status = PubSub.subscribe("status", function (topic, message) {
            this.setState({
                hasLogin: true,
                name: message[0],
                coins: message[1].toNumber(),
                hp: message[2].toNumber(),
                level: message[3].toNumber(),
                exp: message[4].toNumber(),
                atk: message[5].toNumber(),
                def: message[6].toNumber()
            });
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_status);
    };

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand">{this.state.name || "Dungeon"}</a>

                {this.state.hasLogin &&
                <ul className="navbar-nav justify-content-start w-50 row">
                    <li className="nav-item navbar-text mr-4 ml-4">
                        $ {this.state.coins}
                    </li>
                    <li className="nav-item navbar-text mr-4">
                        ATK: {this.state.atk}
                    </li>
                    <li className="nav-item navbar-text mr-4">
                        DEF: {this.state.def}
                    </li>
                </ul>
                }

                {this.state.hasLogin &&
                <ul className="navbar-nav justify-content-end w-50 row">
                    <li className="nav-item col-6 navbar-text">
                        <div className="progress">
                            <div className="progress-bar bg-success" role="progressbar" style={{width: this.state.hp + "%"}} aria-valuenow={this.state.hp} aria-valuemin="0" aria-valuemax="100">HP: {this.state.hp}</div>
                        </div>
                    </li>
                    <li className="nav-item col-6 navbar-text">
                        <div className="progress">
                            <div className="progress-bar bg-info" role="progressbar" style={{width: (this.state.exp / 10) + "%"}} aria-valuenow={this.state.exp} aria-valuemin="0" aria-valuemax="1000">EXP: {this.state.exp}</div>
                        </div>
                    </li>
                </ul>
                }
            </nav>
        );
    }
}

export default Nav;
