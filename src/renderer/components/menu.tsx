
import { Menu as HMenu, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

export function MenuButton({ label, onClick }: { label: string, onClick: () => void }) {
    return <div>
        <HMenu.Item>
            {({ active }) => (
                <button onClick={onClick} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                    {label}
                </button>
            )}
        </HMenu.Item>
    </div>
}

export function Menu({ icon, children }: React.PropsWithChildren<{
    icon: string
}>) {
    return (
        <HMenu as='div' className='relative inline-block text-left'>
            <div>
                <HMenu.Button className="text-black translate-y-1 text-xl opacity-50 hover:opacity-100 transition-opacity">
                    <Icon icon={icon}/>
                </HMenu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <HMenu.Items className="absolute p-1 right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {children}
                </HMenu.Items>
            </Transition>
        </HMenu>
    );
}

export default Menu;