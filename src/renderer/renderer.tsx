
// Launchbox: because ic3's alt manager SUCKS

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Icon } from '@iconify/react';
import { Tab } from '@headlessui/react';

import { AccountManager, Account } from './account';
import { GameManager, Game } from './game';
import Input from './components/input';
import GamesList from './components/games-list';
import AccountListOld from './components/account-list';

function PanelTab({ icon, label }: { icon: string, label: string }) {
    return <Tab className={({selected}) => `flex items-center justify-center p-2 gap-1 grow rounded ${selected ? 'bg-green-500 text-white shadow-md' : 'dark:text-zinc-400'}`}>
            <Icon className="text-xl" icon={icon}/> {label}
        </Tab>
}

interface PanelProps { accountManager: AccountManager; gameManager: GameManager; }
interface PanelState { selectedAccount?: Account; }
class Panel extends React.Component<PanelProps, PanelState> {
    constructor(props: PanelProps) {
        super(props);

        this.state = {
            selectedAccount: undefined
        }

        this.props.accountManager.on('account-selected', (account: Account) => {
            this.setState(state => ({ selectedAccount: account }));
        })
    }

    render() {
        return <div className="flex flex-col h-screen flex-grow bg-zinc-100 dark:bg-zinc-800">
            <Tab.Group>
                <Tab.List className="flex justify-evenly p-2 w-full shadow-md">
                    <PanelTab icon="fluent:globe-16-filled" label="Games"/>
                    <PanelTab icon="fluent:person-16-filled" label="Account"/>
                    <PanelTab icon="fluent:app-folder-24-filled" label="Versions"/>
                    <PanelTab icon="fluent:settings-16-filled" label="Settings"/>
                </Tab.List>
                <Tab.Panels className="h-full p-2">
                    <Tab.Panel className="h-full" unmount={false}>
                        <GamesList gameManager={this.props.gameManager} accountManager={this.props.accountManager}/>
                    </Tab.Panel>
                    <Tab.Panel unmount={false}>
                        <Input disabled 
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
    private gameManager: GameManager;

    render() {
        return (
        <div className="flex select-none h-screen w-screen bg-black">
            <AccountListOld accountManager={this.accountManager}/>
            <Panel accountManager={this.accountManager} gameManager={this.gameManager}/>
        </div>)
    }

    constructor(props: {}) {
        super(props);

        this.accountManager = new AccountManager();
        this.accountManager.mountFromStorage();

        this.gameManager = new GameManager();
        this.gameManager.mountFromStorage();
    }
}

// main routine

const container = document.createElement('div');
document.body.append(container);
const root = ReactDOM.createRoot(container);
root.render(<LaunchboxApp/>);