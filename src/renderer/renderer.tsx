
// Launchbox: because ic3's alt manager SUCKS

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Icon } from '@iconify/react';
import { Tab } from '@headlessui/react';

import Spinner from './spinner';
import { AccountManager, Account } from './account';
import { Browser, BrowserCookie } from './browser';

/* ================================================================================== */

class GamesList extends React.Component {
    
}

/* ================================================================================== */

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
                this.props.accountManager.mountAccountFromCookieAsync(robloSecurityCookie.value);
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

function AccountOptionTab({ icon, label }: { icon: string, label: string }) {
    return <Tab className={({selected}) => `flex items-center justify-center p-2 gap-1 grow rounded ${selected ? 'bg-green-500 text-white shadow-md' : ''}`}>
            <Icon className="text-xl" icon={icon}/> {label}
        </Tab>
}

function AccountOptionInput({ 
        id, label, placeholder, value, disabled = false, description }: 
        { id: string, label: string, placeholder: string, value: string, disabled?: boolean, description?: string }) {
    return <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          disabled={disabled}
          type="text"
          name={id}
          id={id}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder={placeholder}
          value={value}
        />
      </div>
      {description && 
      <p className="mt-2 text-sm text-gray-500">
       {description}
      </p>}
    </div>
}

interface AccountOptionsProps { accountManager: AccountManager; }
interface AccountOptionsState { selectedAccount?: Account; }
class AccountOptions extends React.Component<AccountOptionsProps, AccountOptionsState> {
    constructor(props: AccountOptionsProps) {
        super(props);

        this.state = {
            selectedAccount: undefined
        }

        this.props.accountManager.on('account-selected', (account: Account) => {
            this.setState(state => ({ selectedAccount: account }));
        })
    }

    render() {
        return <div className="flex flex-col gap-2 h-screen flex-grow bg-zinc-100">
            <Tab.Group>
                <Tab.List className="flex justify-evenly p-2 w-full shadow-md">
                    <AccountOptionTab icon="fluent:globe-16-filled" label="Games"/>
                    <AccountOptionTab icon="fluent:person-16-filled" label="Account"/>
                    <AccountOptionTab icon="fluent:app-folder-24-filled" label="Versions"/>
                    <AccountOptionTab icon="fluent:settings-16-filled" label="Settings"/>
                </Tab.List>
                <Tab.Panels className="p-4">
                    <Tab.Panel>ho</Tab.Panel>
                    <Tab.Panel>
                        <AccountOptionInput disabled 
                            value={this.state.selectedAccount?.username ?? 'No account selected.'}
                            description="This is your username, not your nickname." 
                            id="username" label="Username" placeholder="This is your Roblox username."/>
                    </Tab.Panel>
                    <Tab.Panel>ho</Tab.Panel>
                    <Tab.Panel>ha</Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    }
}

class LaunchboxApp extends React.Component {
    private accountManager: AccountManager;

    render() {
        return (
        <div className="flex select-none h-screen w-screen bg-black">
            <AccountList accountManager={this.accountManager}/>
            <AccountOptions accountManager={this.accountManager}/>
        </div>)
    }

    constructor(props: {}) {
        super(props);

        this.accountManager = new AccountManager();
        this.accountManager.mountAccountsFromStorage();
    }
}

// main routine

const container = document.createElement('div');
document.body.append(container);
const root = ReactDOM.createRoot(container);
root.render(<LaunchboxApp/>);