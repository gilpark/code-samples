import React,{Component} from 'react';
import connect from "react-redux/es/connect/connect";
import {Socket$} from  '../../Util/WebSocket$'

const mapVal =(value,min1,max1,min2,max2) =>{
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1))
}

function value_limit(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

class VideoModule extends Component {
    constructor(props){
        super(props)

        console.log('video.js',props.clips.props, props.video_index)
        this.state = {src : this.props.config.base_url +props.clips[props.video_index[0]],
            index : 0, debug:"", debug2:""}
        console.log("video.js",this.props)

    }
    componentWillUnmount(){
      this.msg$.removeListener(this.videolistener)
        clearInterval(this.interval)
    }


    componentDidMount(){
        let isMaster = this.props.config.id === '0' || this.props.config.id === 0
        let video = this.video

        if(this.props.video_index.length ===1){
            video.loop = true
        }
        if(isMaster){
            this.interval = setInterval(()=>{
                let msg = { action: 'VID_UPDATE',
                    data:{status: 'play', time: video.currentTime}}
                let src = video.src
                if(!src.includes('undefined'))
                Socket$.ws().send(JSON.stringify(msg))
            },20)

            video.addEventListener('ended',()=>{
                let index = this.state.index
                index++
                let idx = index%this.props.video_index.length;
                console.log("video.js","done", idx-1 ,this.props.video_index)
                console.log("video.js","next", this.props.video_index[idx],
                    this.props.config.base_url + this.props.clips[this.props.video_index[idx]])
                this.setState({src: this.props.config.base_url + this.props.clips[this.props.video_index[idx]],index : idx})

                //update index
                let msg = { action: 'VID_UPDATE',
                    data:{status: 'swap', index : this.state.index }}
                Socket$.ws().send(JSON.stringify(msg))
            })
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
            if(status === 'swap' ){
                let video_index = msg.data.index
                this.setState({src: this.props.config.base_url +
                        this.props.clips[this.props.video_index[video_index]],index : video_index})
            }
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
              <video ref={(c) => this.video = c}
                       crossOrigin = 'Anonymous'
                       src= {this.state.src}
                       // muted={'muted'}
                       autoPlay={'autoPlay'}
                   preload='auto'
                   className={className}
                >
                <source  src={this.state.src}  type="video/mp4" />

            </video>
            </div>
        )
    }
}
export default connect((store) => {
    return{
        mode : store.mode,
        config : store.config,
        clips : store.clips,
        video_index : store.video_index
    }
})(VideoModule)
