import {useEffect, useState} from "react";
import * as firebase from "firebase";

export const useRLDB = () =>{
    const [f,setF] = useState([])
    const [isLoading, setLoading] = useState(true)
    useEffect(()=>{
        const onValueChange = (newData) => {
            if(newData.val()) setF(Object.values(newData.val()))
            else setF([])
            setLoading(false)
        }
        const rootRef = firebase.database().ref('/')
        rootRef.on('value', onValueChange)
        return () =>{
            rootRef.off('value', onValueChange)
        }
    },[])
    return [f,isLoading]
}