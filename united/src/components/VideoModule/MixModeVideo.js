import connect from "react-redux/es/connect/connect";
import React,{Component} from 'react';

class MixModeVideo extends Component {
  constructor(props){
    super(props)
    console.log("mix video","props",props)
    this.state = {src : props.config.base_url + props.mix }
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
                 src={this.state.src}
                 muted={'muted'}
                 autoPlay={'autoPlay'}
                 loop={'loop'}
                 className={className}
          />
        </div>
    )
  }
}
export default connect((store) => {
  return{
    mode : store.mode,
    config : store.config,
      mix : store.mix
  }
})(MixModeVideo)