import {connect} from 'react-redux'
import {makeComponent} from '@cycle/react'
import {input,button,div,br,select,option,label} from '@cycle/react-dom';
import xs from 'xstream'
import {UPDATE_MODE_CONFIG} from "../store/reducers";
import flattenSequentially from 'xstream/extra/flattenSequentially'
import {getBaseURLObservable,writeToStorageObservable,readFromStorageObservable} from '../Util/utils'

const buildState = (state,data,error) => ({state :state, data : data, error: error})

const config = (sources) =>{
    //inputs
    const serverInputVal$ = sources.react.select('server_ip').events('input').map(ev => ev.target.value).startWith('192.168.1.2')
    const deviceVal$ =  sources.react.select('id_select').events('Change').map(ev => ev.target.value).startWith(0)
    const sideVal$ =  sources.react.select('side_select').events('Change').map(ev => ev.target.value).startWith('left')
    const btn$ = sources.react.select('btn').events('click').mapTo(true)
    const input$ = xs.combine(serverInputVal$,deviceVal$,sideVal$,getBaseURLObservable(),btn$)
        .map(data => {
            let ip = data[0]
            let id = data[1]
            let side = data[2]
            let url = data[3]
            let config = {id: id, server: ip, base_url: url, side: side}
            console.log(config)
             return writeToStorageObservable('config',config)
        })
          .compose(flattenSequentially)
          .map(x => buildState(1,x,null))

    //logic
    const getFlag$ = sources.react.props().map(p => p.flag === 'overwrite')
    const readConfig$ = readFromStorageObservable('config')
        .map(json => buildState(1,json,null))


    const whenConfigEntered$ = getFlag$.map(isOverwriting => {
        return isOverwriting ?  xs.empty(): readConfig$ }).compose(flattenSequentially)
        .replaceError(err => xs.of(buildState(-1,null,err)))

    whenConfigEntered$.subscribe({next : data => {
        let flag = data.state
        let config = data.data
        if(flag === -1){
            console.log("error")
        } else if(flag === 0){
            console.log("resetting the value")
        }
        else {
            console.log("move to next state",JSON.parse(config))
          sources.react.props()._v.dispatch(UPDATE_MODE_CONFIG('lobby',JSON.parse(config)))
            // sources.react.props()._v.dispatch(UPDATE_MODE_CONFIG('download',JSON.parse(config)))
        }
    }})

    const view$ =input$.startWith(0).map(data =>{
        if(data !== 0){
            if(data.state === 1){
              sources.react.props()._v.dispatch(UPDATE_MODE_CONFIG('lobby',data.data))
                // sources.react.props()._v.dispatch(UPDATE_MODE_CONFIG('download',data.data))
            }
        }
        return div([
            label({}, 'Device ID: '),
            select({sel : 'id_select'},[
                option('0'),
                option('1'),
                option('2'),
                option('3'),
                option('4'),
                option('5'),
                option('6'),
                option('7'),
                option('8'),
                option('9')
            ]),
            br(),
            label({},'server IP: '),
            input({ sel: 'server_ip', type: 'text' }),
            br(),
            label({},'Side : '),
            select({sel : 'side_select'},[
                option('left'),
                option('right')
            ]),
            br(),
            br(),
            button({sel: 'btn'}, 'Update Config'),
        ])
    })
    return {
        react: view$,
    }
}

const Configuration = makeComponent(config)
export default connect((store) => {
    return{
        mode : store.mode,
        config : store.config,
        flag : store.flag
    }
})(Configuration)