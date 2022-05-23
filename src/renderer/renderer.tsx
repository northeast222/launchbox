
// Launchbox: because ic3's alt manager SUCKS

import aliasDefaults from './alias';
aliasDefaults();

import preact, { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Icon } from '@iconify/react';
import { Tab } from '@headlessui/react';

import { AccountManager, Account } from './account';
import { GameManager, Game } from './game';
import Input from './components/input';
import GamesList from './components/games-list';
import AccountListOld from './components/account-list';

function PanelTab({ icon, label }: { icon: string, label: string }) {
    return (
        <Tab className={({selected}) => `flex items-center justify-center p-2 gap-1 grow rounded ${selected ? 'bg-green-500 dark:bg-green-700 text-white shadow-md' : 'dark:text-zinc-400'}`}>
            <Icon className="text-xl" icon={icon}/> {label}
        </Tab>
    );
}

function Panel({ accountManager, gameManager }: 
    { accountManager: AccountManager; gameManager: GameManager; }) {
    const [selectedAccount, setSelectedAccount] = useState(null as unknown as Account);

    useEffect(() => {
        accountManager.on('account-selected', account => setSelectedAccount(account));
    }, [])

    return (
        <div className="flex flex-col h-screen flex-grow bg-zinc-100 dark:bg-zinc-800">
            <Tab.Group>
                <Tab.List className="flex justify-evenly p-2 w-full shadow-md">
                    <PanelTab icon="fluent:globe-16-filled" label="Games"/>
                    <PanelTab icon="fluent:person-16-filled" label="Account"/>
                    <PanelTab icon="fluent:app-folder-24-filled" label="Versions"/>
                    <PanelTab icon="fluent:settings-16-filled" label="Settings"/>
                </Tab.List>
                <Tab.Panels className="h-full p-2">
                    <Tab.Panel className="h-full" unmount={false}>
                        <GamesList gameManager={gameManager} accountManager={accountManager}/>
                    </Tab.Panel>
                    <Tab.Panel unmount={false}>
                        <Input disabled
                            value={selectedAccount?.username ?? 'No account selected.'}
                            description="This is your username, not your nickname." 
                            id="username" label="Username" placeholder="This is your Roblox username."/>
                    </Tab.Panel>
                    <Tab.Panel>ho</Tab.Panel>
                    <Tab.Panel>ha</Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}

function LaunchboxApp({ accountManager, gameManager }: 
    { accountManager: AccountManager; gameManager: GameManager; }) {
    return (
        <div className="flex select-none h-screen w-screen bg-black">
            <AccountListOld accountManager={accountManager}/>
            <Panel accountManager={accountManager} gameManager={gameManager}/>
        </div>
    );
}

// main routine
const accountManager = new AccountManager();
accountManager.mountFromStorage();

const gameManager = new GameManager();
gameManager.mountFromStorage();

const container = document.createElement('div');
document.body.append(container);
render(<LaunchboxApp gameManager={gameManager} accountManager={accountManager}/>, container);