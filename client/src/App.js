import React, {Component} from "react";
import Nav from "./components/Nav";
import Login from "./components/Login";
import Game from "./components/Game";

import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap";
import PubSub from "pubsub-js";

class App extends Component {
    state = {hasLogin: false};

    componentDidMount = async () => {
        this.pubsub_status = PubSub.subscribe("status", function (topic, message) {
            this.setState({hasLogin: true});
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_status);
    };

    render() {
        return (
            <div>
                <Nav/>
                <div className="container">
                    {!this.state.hasLogin && <Login/>}
                    {this.state.hasLogin && <Game/>}
                </div>
            </div>
        );
    }
}

export default App;
