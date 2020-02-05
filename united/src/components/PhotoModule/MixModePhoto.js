import React,{Component} from 'react';
import connect from "react-redux/es/connect/connect"

class MixModePhoto extends Component {
  constructor(props){
    super(props)
    console.log("mix photo","props",props)
      this.state = {src : props.config.base_url + props.mix }
  }
  render = () => {
    let isPortrait =
        this.props.config.id === 5 || this.props.config.id === 8 ||
        this.props.config.id === '5' || this.props.config.id === '8'
    let className = isPortrait? 'portrait':'landscape'
    return(
        <div>
          <img
              alt="cannot display"
              src={this.state.src}
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
})(MixModePhoto)
