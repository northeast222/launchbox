
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

import Spinner from './spinner';
import { AccountManager, Account } from '../account';
import { Browser, BrowserCookie } from '../browser';

interface AccountListProps { accountManager: AccountManager; }
interface AccountListState { listedAccounts: Account[]; selectedAccount?: Account; }

function AccountHeadshot({ account, manager }: { account: Account, manager: AccountManager }) {
    const [imageUrl, setImageUrl] = useState(undefined as unknown as string);

    manager.getHeadshotImageUrl(account).then((url) => setImageUrl(url));

    return ((imageUrl && <img src={imageUrl} className="h-12 rounded"></img>) || <Spinner/>)
}

class AccountList extends React.Component<AccountListProps, AccountListState> {
    constructor(props: AccountListProps) {
        super(props);

        const knownAccs = [...props.accountManager.accounts()];

        this.state = { 
            listedAccounts: knownAccs,
            selectedAccount: knownAccs[0]
        }

        props.accountManager.on('account-created', (account: Account) => {
            this.setState(previousState => {
                this.props.accountManager.emit('account-selected', account);
                return {
                    listedAccounts: [...props.accountManager.accounts()],
                    selectedAccount: account
                }
            });
        });
    }

    selectAccount(account: Account) {
        this.setState(previousState => ({ selectedAccount: account }));
        this.props.accountManager.emit('account-selected', account);
    }

    addNewAccount() {
        const browserWindow = new Browser('Roblox Authentication');
        browserWindow.on('closed', () => console.log('win has closed'));
        browserWindow.on('navigated', (uri: string, cookies: BrowserCookie[]) => { 
            const robloSecurityCookie = cookies.find(ck => ck.name === '.ROBLOSECURITY');
            if (robloSecurityCookie !== undefined) {
                browserWindow.close();
                this.props.accountManager.mountFromCookieAsync(robloSecurityCookie.value);
            }
        });
        browserWindow.start('https://www.roblox.com/login'); 
    }

    render() {
        return (
            <div className="flex flex-col gap-2 p-2 max-w-sm h-screen bg-zinc-200">
                {this.state.listedAccounts.map(account =>
                    <div className={`flex items-center p-2 gap-2 rounded ${account === this.state.selectedAccount ? 'bg-green-500' : 'bg-zinc-50'} hover:shadow-md hover:cursor-pointer transition-shadow`}
                    onClick={() => this.selectAccount(account)}>
                        <AccountHeadshot account={account} manager={this.props.accountManager}/>
                        <div>
                            <div className={`${account === this.state.selectedAccount ? 'text-white' : ''} text-xl font-bold`}>{account.username}</div>
                            <div className={`${account === this.state.selectedAccount ? 'text-white' : 'text-gray-400'}`}>Last used on N/A</div>
                        </div>
                        <div className="ml-auto mr-2">
                            <Icon className="text-gray-300 text-2xl hover:text-gray-600 transition-colors" icon="fluent:settings-16-regular"/>
                        </div>
                    </div>
                )}
                <div onClick={() => this.addNewAccount()} 
                    className="flex flex-col p-2 rounded bg-green-500 text-white hover:shadow-md hover:cursor-pointer transition-shadow">
                    <div className="text-xl font-bold">Add a new account.</div>
                    <div className="text-gray-100">You will have to authenticate into your Roblox account.</div>
                </div>
            </div>
        )
    }
}

export default AccountList;