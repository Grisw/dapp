import React, {Component} from "react";
import PubSub from "pubsub-js";
import $ from "jquery"

class MatchingModal extends Component {
    state = {bet: 3, account: null, contract: null, isFirst: true, match: null, enemy: ""};

    componentDidMount = async () => {
        const self = this;
        this.pubsub_modal = PubSub.subscribe("matchingmodal", function (topic, message) {
            this.setState({
                account: message.account,
                contract: message.contract,
                bet: message.bet
            }, () => {$("#matchingmodal").modal("show"); self.start();});
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_modal);
    };

    start = async () => {
        const {account, bet, contract} = this.state;

        const result = await contract.startGame(bet, {from: account, gas: 5000000});
        for (let i = 0; i < result.logs.length; i++) {
            let log = result.logs[i];
            if (log.event === "StartGame") {
                this.setState({match: log.args.addr, isFirst: log.args.isFirst, enemy: log.args.name}, async () => {
                    if (this.state.isFirst){
                        while (true){
                            const isConnected = await contract.checkConnection({from: account});
                            if(isConnected){
                                $("#matchingmodal").modal("hide");
                                this.setState({enemy: isConnected}, () => {
                                    PubSub.publish("match", {
                                        isFirst: this.state.isFirst,
                                        match: this.state.match,
                                        enemy: this.state.enemy,
                                        bet: this.state.bet
                                    });
                                });
                                break;
                            }
                        }
                    }else{
                        PubSub.publish("match", {
                            isFirst: this.state.isFirst,
                            match: this.state.match,
                            enemy: this.state.enemy,
                            bet: this.state.bet
                        });
                        $("#matchingmodal").modal("hide");
                    }
                });
                break;
            }
        }
    };

    render() {
        return (
            <div className="modal fade" id="matchingmodal" tabIndex="-1" role="dialog"
                 aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{!this.state.enemy && "正在寻找对手"}{this.state.enemy && "已找到：" + this.state.enemy}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="progress">
                                <div className="progress-bar progress-bar-striped progress-bar-animated w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"/>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MatchingModal;
