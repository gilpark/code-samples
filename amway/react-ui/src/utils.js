import React from "react"
import {FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton} from "react-share";

//todo reaplace icon image
const FBbtn = (url , tag = '#test') =>
      <FacebookShareButton  url={url} hashtag={tag}  >
        <FacebookIcon size={32} round={true} />
      </FacebookShareButton>
const TWbtn = ( url , tags = ["#test","#test2"]) =>
      <TwitterShareButton title={`${tags.join(' ')} \r\n\n`} url={url}>
        <TwitterIcon size={32} round={true}/>
      </TwitterShareButton>

export {FBbtn,TWbtn}