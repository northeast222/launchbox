
/* Change below to target another website (such as sitetest) */

import { number } from "yup";


export interface Endpoint {
    uri: string;
    format?(uri: string, args: string[]): string
}

export function resolveEndpoint<T extends Endpoint>(endpoint: T, args: string[]) {
    if (endpoint.format) {
        return endpoint.format(endpoint.uri, args);
    } else {
        return endpoint.uri;
    }
}

/*
*   =================================
*   List of known endpoints
*   Only add the useful ones please
*   =================================
*/

export const endpoints = {
    getUserIdByUsername:  {
        uri: 'https://api.roblox.com/users/get-by-username',
        format: (uri: string, [username]: string[]) => `${uri}?username=${username};`
    },

    getAuthenticationTicket: {
        uri: 'https://www.roblox.com/v1/authentication-ticket/'
    },

    getUserInfo: {
        uri: 'https://www.roblox.com/mobileapi/userinfo'
    },

    getAvatarBust: {
        uri: 'https://thumbnails.roblox.com/v1/users/avatar-bust',
        format: (uri: string, [userId, size]: string[]) => `${uri}?userIds=${userId}&size=${size}&format=Png&isCircular=false`
    }
};