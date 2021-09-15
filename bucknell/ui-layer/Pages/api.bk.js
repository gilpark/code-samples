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
const registrationDataBase = {
    studentType:"",
    email:"",
    email2:"",
    firstName:"",
    middleNAme:"",
    lastName:"",
    preferredName:"",
    birthday:"",
    gender:"",
    permanentAddress:
        {
            address1:"",
            address2:"",
            city:"",
            region:"",
            postalCode:"",
            country:""
        },
    isAddressSame:"yes",
    homePhone:"",
    mobilePhone:"",
    phonePermission:false,
    parentEmail:"",
    highschoolGradYear:"",
    highschool:"",
    highschoolCeebCode:"",
    expectedEntryTerm:"",
    academicInterest:"",
    secondaryInterest:"",
    hispanicEthnicity:"",
    race:{IndianOrNative:false,asian:false,black:false,hawaiianOrIslander:false,white:false},
    primaryCitizenship:""
    ,dualCitizenship:""
    ,otherCitizenship:""
}

export const formatRegData = d =>{
    const data = {...registrationDataBase, ...d}
    const bday = data.birthday
    const bdayFormatted = (bday && bday !== "")?`${bday.month}/${bday.day}/${bday.year}`:""

    let permanentAddress_street1 =  data.permanentAddress.address1
    let permanentAddress_street2 = data.permanentAddress.address2
    let permanentAddress_city =  data.permanentAddress.city
    let permanentAddress_state = data.permanentAddress.region
    let permanentAddress_zip = data.permanentAddress.postalCode
    let permanentAddress_country = data.permanentAddress.country

    // let mailingAddress = address
    let mailingAddress_street1 =  data.permanentAddress.address1
    let mailingAddress_street2 = data.permanentAddress.address2
    let mailingAddress_city = data.permanentAddress.city
    let mailingAddress_state = data.permanentAddress.region
    let mailingAddress_zip = data.permanentAddress.postalCode
    let mailingAddress_country = data.permanentAddress.country

    if(data.mailingAddress){
        mailingAddress_street1 = data.mailingAddress.address1
        mailingAddress_street2 = data.mailingAddress.address2
        mailingAddress_city = data.mailingAddress.city
        mailingAddress_state = data.mailingAddress.region
        mailingAddress_zip =  data.mailingAddress.postalCode
        mailingAddress_country = data.mailingAddress.country
    }
    const race = data.race
    const isAmerican = race.IndianOrNative?"American Indian or Alaska Native":""
    const isAsian = race.asian?"Asian":""
    const isBlack = race.black?"Black or African American":""
    const isHwaiian = race.hawaiianOrIslander?"Native Hawaiian or Other Pacific Islander":""
    const isWhite = race.white?"White":""
    const raceMerged = [isAmerican,isAsian,isBlack,isHwaiian,isWhite].filter(d => d !=="")
    console.log(data.phonePermission)
    const parsed = {
        ...data,
        birthday: bdayFormatted === '//'?"":bdayFormatted,
        permanentAddress_street1:permanentAddress_street1,
        permanentAddress_street2:permanentAddress_street2,
        permanentAddress_city :permanentAddress_city,
        permanentAddress_state:permanentAddress_state,
        permanentAddress_zip :permanentAddress_zip,
        permanentAddress_country:permanentAddress_country,
        mailingAddress_street1:mailingAddress_street1,
        mailingAddress_street2:mailingAddress_street2,
        mailingAddress_city :mailingAddress_city,
        mailingAddress_state:mailingAddress_state,
        mailingAddress_zip :mailingAddress_zip,
        mailingAddress_country:mailingAddress_country,
        race:raceMerged.toString(),
        phonePermission : data.phonePermission?'yes' :'no'
    }
    delete parsed['email2']
    delete parsed['isAddressSame']
    delete parsed['permanentAddress']
    delete parsed['mailingAddress']
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