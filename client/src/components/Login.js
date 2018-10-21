import React, {Component} from "react";
import PubSub from "pubsub-js";
import NameModal from "./NameModal";

class Login extends Component {
    state = {account: ""};

    login = async () => {
        const account = this.state.account;
        const contract = this.props.contract;

        try{
            const isSignedUp = await contract.isSignedUp({from: account});
            if (!isSignedUp){
                PubSub.publish("namemodal", {account, contract});
            }else{
                const name = await contract.getName({from: account});
                PubSub.publish("name", {name: name, account: account});
                const coins = await contract.getCoins({from: account});
                PubSub.publish("coins", coins);
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
