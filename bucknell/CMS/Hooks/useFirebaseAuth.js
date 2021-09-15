import React, {useCallback, useEffect, useState} from 'react'
import * as firebase from "firebase"
import {functional as f} from '../utils/functional.es'
import {matches} from 'z'

export function useFirebaseAuth(){
    const sessionStorage = window.sessionStorage
    const [isLoggedIn,setLogin] = useState(sessionStorage.isLoggedIn  === 'true')
    const [user,setUser] = useState(sessionStorage.user?JSON.parse(sessionStorage.user): {})
    const [error,setError] = useState(null)

    const setUserData = user =>{
        const isUser = user !== undefined || false
        setUser(isUser? user :{})
        sessionStorage.setItem('user',JSON.stringify(isUser? user :{}))
        sessionStorage.setItem('isLoggedIn',isUser?'true':'false')
        setLogin(isUser)
        console.log(user,0)
        return user
    }

    const logIn = (email,password) =>{
        return  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(()=> firebase.auth().signInWithEmailAndPassword(email, password))
    }
    const logOut = () =>  firebase.auth().signOut().catch(setError)
    useEffect(()=>  firebase.auth().onAuthStateChanged(async cred =>{
        if(cred){
            f.go(
                firebase.firestore().collection('users').doc(cred.uid).get(),
                d => ({...d.data(), uid: d.id}),
                data => ({email: data.email, name: data.name, tier: data.tier, uid: data.uid}),
                setUserData
            )
        }else{
            setUserData()
        }

    }),[])
    return [isLoggedIn, user, logIn, logOut, error]
}