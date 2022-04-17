
// Launchbox: because ic3's alt manager SUCKS

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Icon } from '@iconify/react';
import { Tab } from '@headlessui/react';

import { AccountManager, Account } from './account';
import { GameManager, Game } from './game';
import GamesList from './components/games-list';
import AccountList from './components/account-list';

function PanelTab({ icon, label }: { icon: string, label: string }) {
    return <Tab className={({selected}) => `flex items-center justify-center p-2 gap-1 grow rounded ${selected ? 'bg-green-500 text-white shadow-md' : ''}`}>
            <Icon className="text-xl" icon={icon}/> {label}
        </Tab>
}

function PanelInput({ 
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
        return <div className="flex flex-col gap-2 h-screen flex-grow bg-zinc-100">
            <Tab.Group>
                <Tab.List className="flex justify-evenly p-2 w-full shadow-md">
                    <PanelTab icon="fluent:globe-16-filled" label="Games"/>
                    <PanelTab icon="fluent:person-16-filled" label="Account"/>
                    <PanelTab icon="fluent:app-folder-24-filled" label="Versions"/>
                    <PanelTab icon="fluent:settings-16-filled" label="Settings"/>
                </Tab.List>
                <Tab.Panels className="p-4">
                    <Tab.Panel unmount={false}>
                        <GamesList gameManager={this.props.gameManager}/>
                    </Tab.Panel>
                    <Tab.Panel unmount={false}>
                        <PanelInput disabled 
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
            <AccountList accountManager={this.accountManager}/>
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