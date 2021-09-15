import * as firebase from "firebase"
import {functional as f} from '../../../utils/functional.es.js'
import {useEffect, useState} from "react"
import {atom} from "recoil"

const fetchData = (url, payload) => {
       let urlEncodedData = "", urlEncodedDataPairs = []
       for(const k in payload) urlEncodedDataPairs.push(encodeURIComponent( k ) + '=' + encodeURIComponent( payload[k] ))
       urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' )
       return f.go(
           fetch(url,{method:'post',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                  body: urlEncodedData }),
           r=>r.json(),
       )
}
const addNewAdminUser = async (email, name, tier, password) =>{
       const url = 'https://bucknell-342ca.web.app/api/users/new_admin'
       const payload = {
              email: email,
              name: name,
              tier: tier,
              password: password
       }
       const res = await fetchData(url,payload)
       const {success, data, message} = res
       if(success !== 1 || res.error) {
              throw new Error(res.error|| message)
       }
       return data
}
const deleteAdminUser = async ({uid,email}) =>{
       const url = 'https://bucknell-342ca.web.app/api/users/delete_admin'
       const payload = {
              email: email,
       }
       const delUser = await firebase.firestore().doc(`users/${uid}`).delete()
       const res = await fetchData(url,payload)
       const {success, message} = res
       if(success !== 1) {
              throw new Error(res.error|| message)
       }
       return res
}
export const useUsers = () =>{
       const [users,setUsers] = useState([])
       useEffect(()=>{
              const dispose = firebase.firestore()
                  .collection('users')
                  .onSnapshot(snapshot => {
                         const {docs} = snapshot
                         f.go(docs, f.mapC(d => ({uid:d.id,...d.data()})), setUsers)
                  })
              return ()=> dispose()
       },[])
       return {
              data: users,
              addUser:addNewAdminUser,
              deleteUser:deleteAdminUser,
       }
}

export const userMultiSelect = atom(
    {key:'userMultiSelect',default:[]}
)

export function validateEmail(email) {
       const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
       return re.test(String(email).toLowerCase());
}