import {atom} from "recoil";

export function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
export function ConvertToCSV(objArray,sperator=';') {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = `${Object.keys(array[0]).join(sperator)}\r\n`;
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line !== '') line += sperator
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}
//todo re order names

const registrationDataBase = {
    guestType:"",
    email:"",
    firstName:"",
    middleNAme:"",
    lastName:"",
    preferredName:"",
    birthday:"",
    expectedEntryTerm:"",
}

export const formatRegData = d =>{
    const data = {...registrationDataBase, ...d}
    const bday = data.birthday
    const bdayFormatted = (bday && bday !== "")?`${bday.month}/${bday.day}/${bday.year}`:""
    const parsed = {
        ...data,
        birthday: bdayFormatted === '//'?"":bdayFormatted,
    }
    delete parsed['email2']
    return parsed
}
export const uploadData = data => {
    let urlEncodedData = "",
        urlEncodedDataPairs = []
    for(const k in data) urlEncodedDataPairs.push(encodeURIComponent( k ) + '=' + encodeURIComponent( data[k] ))
    urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' )
    return fetch(
        // 'http://localhost:5001/bucknell-342ca/us-central1/api/users/new_applicant',
        'https://bucknell-342ca.web.app/api/users/new_applicant',
        {
            method:'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: urlEncodedData
        })
}
export const updateCRM = data => {
    let urlEncodedData = "",
        urlEncodedDataPairs = []
    for(const k in data) urlEncodedDataPairs.push(encodeURIComponent( k ) + '=' + encodeURIComponent( data[k] ))
    urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' )
    return fetch(
        // 'http://localhost:5001/bucknell-342ca/us-central1/api/users/update_applicant',
        'https://bucknell-342ca.web.app/api/users/update_applicant',
        {
            method:'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: urlEncodedData
        })
}

export const Login = email =>{
    let urlEncodedData = "",
        urlEncodedDataPairs = []
    const payload = {email:email}
    for(const k in payload) urlEncodedDataPairs.push(encodeURIComponent( k ) + '=' + encodeURIComponent( payload[k] ))
    urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' )
    const url = 'https://bucknell-342ca.web.app/api/users/login_applicant'
    return fetch(
        url,
        {
            method:'post',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: urlEncodedData
        })
}

export const downloadCSV = (name,url) =>{
    const a = document.createElement('A');
    a.href =url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
export const APP_SATE = {
    REGISTRATION:0,
    VIRTUAL_TOUR:1
}
export const appState = atom({key:'appState', default: APP_SATE.REGISTRATION})
export const galleryIndex = atom({key:'galleryIndex', default: 0})
export const playcanvasReady = atom({key:'playcanvasReady', default: false})