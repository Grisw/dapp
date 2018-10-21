import React, {Component} from "react";
import PubSub from "pubsub-js";
import MatchingModal from "./MatchingModal";

class GameStart extends Component {
    state = {bet: 3, coins: 0};

    componentDidMount = async () => {
        this.pubsub_coins = PubSub.subscribe("coins", function (topic, message) {
            this.setState({
                coins: message.toNumber()
            });
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_coins);
    };

    start = async () => {
        PubSub.publish("matchingmodal", {contract: this.props.contract, account: this.props.account, bet: this.state.bet});
    };

    render() {
        return (
            <div className="row mt-5">
                <form className="form-horizontal col-5 m-auto">
                    <div className="form-group text-center">
                        <div id="bet" className="btn-group btn-group-toggle" data-toggle="buttons">
                            <label className={"btn btn-primary" + (this.state.bet === 3 ? " active": "")}>
                                <input type="radio" name="options" autoComplete="off" checked={this.state.bet === 3} onChange={()=>this.setState({bet: 3})}/>$ 3
                            </label>
                            <label className={"btn btn-primary" + (this.state.bet === 6 ? " active": "")}>
                                <input type="radio" name="options" autoComplete="off" checked={this.state.bet === 6} onChange={()=>this.setState({bet: 6})}/>$ 6
                            </label>
                            <label className={"btn btn-primary" + (this.state.bet === 9 ? " active": "")}>
                                <input type="radio" name="options" autoComplete="off" checked={this.state.bet === 9} onChange={()=>this.setState({bet: 9})}/>$ 9
                            </label>
                            <label className={"btn btn-primary" + (this.state.bet === 15 ? " active": "")}>
                                <input type="radio" name="options" autoComplete="off" checked={this.state.bet === 15} onChange={()=>this.setState({bet: 15})}/>$ 15
                            </label>
                        </div>
                    </div>
                    <div className="form-group mt-4">
                        <div className="col-8 m-auto">
                            <button type="button" className="btn btn-default col-12" onClick={this.start}>开始</button>
                        </div>
                    </div>
                </form>
                <MatchingModal/>
            </div>
        );
    }
}

export default GameStart;
