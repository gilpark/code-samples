import * as firebase from "firebase";

export const relocate = path => {
    const pathname = window.location.pathname;
    if (pathname !== path)
        window.location.replace(`${window.location.origin}${path}`);
};

export const onPermissionExist = permission => {
    if (permission) {
        console.log(permission);
        if (permission.type > 1) {
            relocate(`/admin`);
        } else {
            relocate(`/events/${permission.room_access}`);
        }
        return true;
    }
    return false;
};

export const compose = (...fns) => x =>
    fns.reduce(async (y, f) => await f(y), x);
export const route2Default = permission => {
    const type = permission.type;
    switch (type) {
        case 3:
            relocate("/admin");
            break;
        case 0:
            relocate(`/events/${permission.room_access}`);
            break;
        default:
            relocate("/");
    }
};
export const isProduction = process.env.NODE_ENV === "development";
export const conditionally = config => props => {
    return config.if(props) ? config.then(props) : config.else(props);
};
export const asyncConditionally = config => async props => {
    return (await config.if(props))
        ? await config.then(props)
        : await config.else(props);
};
export const isPermissionExist = p => p !== null && p !== undefined;

export function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
