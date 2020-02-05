import connect from "react-redux/es/connect/connect";
import React,{Component} from 'react';

class MixVideo extends Component {
  constructor(props){
    super(props)
    this.state = {src : this.props.config.base_url +
          props.MixClips
          .filter(x => parseInt(x.index) === parseInt(this.props.mix_video_index))
          .map(x => x.filename)
    }
    console.log("video.js",this.props)
  }

  componentDidMount(){
    let video = this.video
      video.loop = true
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
                 muted={'muted'}
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
    MixClips : store.MixClips,
    mix_video_index : store.mix_video_index
  }
})(MixVideo)