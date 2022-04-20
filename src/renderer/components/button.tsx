
import React from 'react';

function Button({ onClick, classes, main, children }: React.PropsWithChildren<{ onClick?: () => void, classes?: string, main?: boolean }>) {
    const classesToUse = main
        ? `${classes} inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`
        : `${classes} inline-flex items-center px-4 py-2 border border-gray-300 dark:border-zinc-800 shadow-sm text-base font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`;
    return <button type="button" onClick={onClick}
        className={classesToUse}
      >
        {children}
      </button>
}

export default Button;