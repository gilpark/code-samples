import {useEffect, useRef, useState} from "react"

function useInterval(callback, delay) {
    const intervalId = useRef(null)
    const savedCallback = useRef(callback)
    useEffect(() => {
        savedCallback.current = callback
    })
    useEffect(() => {
        const tick = () => savedCallback.current()
        if (typeof delay === 'number') {
            intervalId.current = window.setInterval(tick, delay)
            return () => window.clearInterval(intervalId.current)
        }
    }, [delay])
    return intervalId.current
}
export const usePlayCanvas = () =>{
    const [instance, setInstance] = useState(null)
    const [status, setStatus] = useState('running')
    useInterval(()=>{
        const instance = window.pc.Application.getApplication()

        console.log("[react]looking for pc instance",instance)
        if(instance){
            setInstance(instance)
            window.pcApp = instance
        }
    }, status === 'running'? 100 : null)
    useEffect(()=>{
        if(instance) setStatus('found')
    },[instance])
    return instance
}
