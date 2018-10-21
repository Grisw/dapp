import React, {Component} from "react";
import GameContract from "../contracts/Game.json";
import getWeb3 from "../utils/getWeb3";
import truffleContract from "truffle-contract";
import PubSub from "pubsub-js";
import NameModal from "./NameModal";

class Login extends Component {
    state = {web3: null, account: "", name: "", contract: null};

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
    };

    login = async () => {
        const {account, contract} = this.state;

        try{
            const isSignedUp = await contract.isSignedUp({from: account});
            if (!isSignedUp){
                PubSub.publish("namemodal", {account, contract});
            }else{
                const status = await contract.getStatus({from: account});
                PubSub.publish("status", status);
            }
        }catch (e) {
            alert("账号错误，请先解锁账户。");
            console.log(e);
        }
    };

    render() {
        return (
            <div className="row">
                <form className="form-horizontal col-5 m-auto">
                    <div className="form-group">
                        <label htmlFor="account" className="control-label">账号</label>
                        <input type="text" className="form-control" id="account" placeholder="请输入账号" value={this.state.account} onChange={(event) => this.setState({ account: event.target.value })} />
                    </div>
                    <div className="form-group">
                        <div className="col-8 m-auto">
                            <button type="button" className="btn btn-default col-12" onClick={this.login}>登录</button>
                        </div>
                    </div>
                </form>
                <NameModal/>
            </div>
        );
    }
}

export default Login;
