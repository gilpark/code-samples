import axios from 'axios';
import {writable} from "svelte/store";

//todo remove this on production
const str = JSON.stringify({
    PIPE:"https://playcanv.as/e/b/KJpypzAC",
    STEAM:"https://playcanv.as/e/b/sisZ1Fi4",
    ITEC:"https://playcanv.as/e/b/Q4sRSY7d",
})
const encryptedContent = CryptoJS.AES.encrypt(str, 'IUOE-AR').toString();
console.log(encryptedContent)

const gistURL = 'https://api.github.com/gists/f546f6af53e78d3759395f618e44b76c'
export default () => axios(gistURL, {
    headers: {'Accept' : 'application/vnd.github.v3+json'}})
    .then( res => {
        const encryptedContent = res?.data?.files?.build?.content
        const bytes  = CryptoJS.AES.decrypt(encryptedContent, 'IUOE-AR');
        const originalStr = bytes.toString(CryptoJS.enc.Utf8)
        return JSON.parse(originalStr)
    }).catch( error => console.error(error))
