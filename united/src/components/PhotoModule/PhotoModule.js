import React,{Component} from 'react';
import connect from "react-redux/es/connect/connect"

class photoModule extends Component {
  constructor(props){
    super(props)
    console.log("photo",props)
    console.log("photo",props.collage[`c${props.collage_index}`])
    this.state = {src : props.config.base_url + props.collage[`c${props.collage_index}`] }
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
    collage : store.collage,
    collage_index : store.collage_index
  }
})(photoModule)
