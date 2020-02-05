import React,{Component} from 'react';
import connect from "react-redux/es/connect/connect";
import {Socket$} from  '../../Util/WebSocket$'
const mapVal =(value,min1,max1,min2,max2) =>{
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1))
}

function value_limit(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

class IdlePlayer extends Component {
    constructor(props){
        super(props)
        console.log("idle.js",this.props)
        this.state = {status : ""}
    }
    componentWillUnmount(){

        this.msg$.removeListener(this.videolistener)
        clearInterval(this.interval)
    }

    componentDidMount(){
        let isMaster = this.props.config.id === '0' || this.props.config.id === 0
        console.log("is this Master",isMaster)
        let video = this.video
        video.loop = true

        if(isMaster){
            this.interval = setInterval(()=>{
                let msg = { action: 'VID_UPDATE',
                    data:{status: 'play', time: video.currentTime }}
                let src = video.src
                if(!src.includes('undefined'))
                    Socket$.ws().send(JSON.stringify(msg))
            },20)
        }

        this.videolistener = {
            next: msg => this.handleData(msg),
            error : e => console.log("video.js",e),
            stop: () => console.log("video.js","XXXXXXXXXXXX")
        }
        this.msg$ = Socket$.stream.filter(msg => msg.action ==='VID_UPDATE')
        this.msg$.addListener(this.videolistener)
    }

    handleData = (msg) =>{

        let video = this.video
        let status = msg.data.status
        let isMaster = this.props.config.id === '0' || this.props.config.id === 0

        if(!isMaster){
            if(status === 'play' ) {
                let targetTime = msg.data.time
                let timeDiff = targetTime - video.currentTime
                let targetSpeed = mapVal(timeDiff, -0.1, 0.1, 0,2)

                if( Math.abs(timeDiff) > 0.3){
                    console.log("video.js","overwrite time-code",Math.abs(timeDiff))
                    video.currentTime = targetTime
                    video.playbackRate = 1
                }
                video.playbackRate =value_limit(targetSpeed,0,2)

            }
        }
    }
    render = () => {
        let isPortrait =
            this.props.config.id === 5 || this.props.config.id === 8 ||
            this.props.config.id === '5' || this.props.config.id === '8'
        let className = isPortrait? 'portrait':'landscape'
        return(
            <div>
                {/*{<p>{this.state.status}</p>}*/}
                <video ref={(c) => this.video = c}
                       crossOrigin = 'Anonymous'
                       autoPlay={'autoPlay'}
                       loop={'loop'}
                       preload='auto'
                       className={className}
                >
                    <source  src= {this.props.config.base_url + this.props.idle}  type="video/mp4" />

                </video>
            </div>
        )
    }
}
export default connect((store) => {
    return{
        mode : store.mode,
        config : store.config,
        idle: store.idle,

    }
})(IdlePlayer)
