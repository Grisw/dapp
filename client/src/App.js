import React, {Component} from "react";
import Nav from "./components/Nav";
import Login from "./components/Login";
import Game from "./components/Game";
import GameContract from "./contracts/Game.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import PubSub from "pubsub-js";

class App extends Component {
    state = {hasLogin: false, account: null, contract: null};

    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();
            const Contract = truffleContract(GameContract);
            Contract.setProvider(web3.currentProvider);
            this.setState({web3, contract: await Contract.deployed()});
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.log(error);
        }

        this.pubsub_name = PubSub.subscribe("name", function (topic, message) {
            this.setState({hasLogin: true, account: message.account});
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_name);
    };

    render() {
        return (
            <div>
                <Nav/>
                <div className="container">
                    {!this.state.hasLogin && <Login contract={this.state.contract}/>}
                    {this.state.hasLogin && <Game account={this.state.account} contract={this.state.contract}/>}
                </div>
            </div>
        );
    }
}

export default App;
