
import preact from 'preact';
import { useState } from 'preact/hooks';
import { Icon } from '@iconify/react';

import Spinner from './spinner';
import { Menu, MenuButton } from './menu';
import { Menu as HMenu } from '@headlessui/react';
import { AccountManager, Account } from '../account';
import { Browser, BrowserCookie } from '../browser';

interface AccountListProps { accountManager: AccountManager; }

function AccountHeadshot({ account, manager }: { account: Account, manager: AccountManager }) {
    const [imageUrl, setImageUrl] = useState(undefined as unknown as string);

    manager.getHeadshotImageUrl(account).then((url) => setImageUrl(url));

    return ((imageUrl && <img src={imageUrl} className="h-12 rounded"></img>) || <Spinner/>)
}

function AccountList(props: AccountListProps) {
    const [listedAccounts, setListedAccounts] = useState<Account[]>([...props.accountManager.accounts()]);
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();

    function selectAccount(account?: Account) {
        props.accountManager.emit('account-selected', account);
        setSelectedAccount(account);
    }

    function addNewAccount() {
        const browserWindow = new Browser('Roblox Authentication');
        browserWindow.on('closed', () => console.log('win has closed'));
        browserWindow.on('navigated', (uri: string, cookies: BrowserCookie[]) => { 
            const robloSecurityCookie = cookies.find(ck => ck.name === '.ROBLOSECURITY');
            if (robloSecurityCookie !== undefined) {
                browserWindow.close();
                props.accountManager.mountFromCookieAsync(robloSecurityCookie.value);
            }
        });
        browserWindow.start('https://www.roblox.com/login'); 
    }

    function removeAccount(account: Account) {
        props.accountManager.unmount(account);
    }

    props.accountManager.on('account-created', (account: Account) => {
        setListedAccounts([...props.accountManager.accounts()]);
        selectAccount(account);
    });

    props.accountManager.on('account-removed', (account: Account) => {
        setListedAccounts([...props.accountManager.accounts()]);
        selectAccount(props.accountManager.accounts()[0]);
    });

    return (
        <div className="flex flex-col gap-2 p-2 max-w-sm h-screen bg-zinc-200 dark:bg-zinc-900">
            {listedAccounts.map(account =>
                <div key={account.id} className={`flex items-center p-2 gap-2 rounded ${account === selectedAccount ? 'bg-green-500 dark:bg-green-700' : 'bg-zinc-50 dark:bg-zinc-700'} hover:shadow-md hover:cursor-pointer transition-shadow`}
                onClick={() => selectAccount(account)}>
                    <AccountHeadshot account={account} manager={props.accountManager}/>
                    <div>
                        <div className={`${account === selectedAccount ? 'text-white' : 'dark:text-white'} text-xl font-bold`}>{account.username}</div>
                        <div className={`${account === selectedAccount ? 'text-white' : 'text-gray-400 dark:text-zinc-300'}`}>Last used on N/A</div>
                    </div>
                    <div className="ml-auto mr-2">
                        <Menu icon='fluent:settings-16-regular'>
                            <MenuButton label="Remove" onClick={() => removeAccount(account)}/>
                        </Menu>
                    </div>
                </div>
            )}
            <div onClick={() => addNewAccount()} 
                className="flex flex-col p-2 rounded bg-green-500 dark:bg-green-700 text-white hover:shadow-md hover:cursor-pointer transition-shadow">
                <div className="text-xl font-bold">Add a new account.</div>
                <div className="text-gray-100">You will have to authenticate into your Roblox account.</div>
            </div>
        </div>
    )
}

export default AccountList;