import React, {Component} from "react";
import PubSub from "pubsub-js";
import $ from "jquery"

class NameModal extends Component {
    state = {name: "", account: null, contract: null};

    componentDidMount = async () => {
        this.pubsub_modal = PubSub.subscribe("namemodal", function (topic, message) {
            this.setState({
                account: message.account,
                contract: message.contract
            }, () => $("#namemodal").modal("show"));
        }.bind(this));
    };

    componentWillUnmount = async () => {
        PubSub.unsubscribe(this.pubsub_modal);
    };

    signup = async () => {
        const {account, contract} = this.state;

        await contract.signup(this.state.name, {from: account});
        const status = await contract.getStatus({from: account});
        PubSub.publish("status", status);
    };

    render() {
        return (
            <div className="modal fade" id="namemodal" tabIndex="-1" role="dialog"
                 aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">输入名字</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form className="form-horizontal m-auto">
                                <input type="text" className="form-control" placeholder="请输入名字" value={this.state.name} onChange={(event) => this.setState({ name: event.target.value })} />
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">关闭</button>
                            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.signup}>确定</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default NameModal;
