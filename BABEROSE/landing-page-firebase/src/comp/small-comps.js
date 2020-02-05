import React from "react";
import {
    FacebookShareButton,
    TwitterShareButton,
} from 'react-share'
// icons from react-feather npm package https://bit.dev/feathericons/react-feather
import * as Icon from 'react-feather';
import {IntersectingCirclesSpinner} from 'react-epic-spinners' // https://github.com/bondz/react-epic-spinners
import DisplayView from "./display";
import PageNotFoundView from "./404";
import styled from 'styled-components'
import {remap} from '../utils'

export const FbButton = ({url, tag, style = {padding:'1vw'}, screenHeight}) =>
        <FacebookShareButton url={url} hashtag={tag} style={style}>
            <Icon.Facebook size={remap(screenHeight,568,2160,50,100,false)}
                           color='#c4c1c9'
                           fill='#c4c1c9'
                           stroke='none'
                           alt={'facebook_button'}/>
        </FacebookShareButton>

export const TwButton = ({url, tags, style = {padding:'1vw'}, screenHeight}) =>
        <TwitterShareButton  className='footer-share' title={`${tags.join(' ')} \r\n\n`} url={url} style={style}>
            <Icon.Twitter size={remap(screenHeight,568,2160,50,100,false)}
                          color='#c4c1c9'
                          fill='#c4c1c9'
                          stroke='none'
                          alt={'twitter_button'}/>
        </TwitterShareButton>

export const DlButton = ({url, filename, style = {backgroundColor:'transparent', outLine:'0', border:'0',padding:'1vw'}, screenHeight}) =>
    <button className={"react-share__ShareButton footer-share"} style={style}>
        <a href={url} download={`${filename}`} >
            <Icon.Download size={remap(screenHeight,568,2160,50,100,false)}
                           color='#c4c1c9'
                           alt={'download_button'}/>
        </a>
    </button>


export const DlButtonSM = ({url, filename, style = {backgroundColor:'transparent', outLine:'0', border:'0',padding:'0.5vw'}, size}) =>
    <button className={"react-share__ShareButton footer-share"} style={style}>
        <a href={url} download={`${filename}`} target="_blank">
            <Icon.Download size={size}
                           color='#c4c1c9'
                           alt={'download_button'}/>
        </a>
    </button>

export const FbButtonSM = ({url, tag, style = {padding:'0.5vw'}, size}) =>
    <FacebookShareButton url={url} hashtag={tag} style={style}>
        <Icon.Facebook size={size}
                       color='#c4c1c9'
                       fill='#c4c1c9'
                       stroke='none'
                       alt={'facebook_button'}/>
    </FacebookShareButton>

export const TwButtonSM = ({url, tags, style = {padding:'0.5vw'}, size}) =>
    <TwitterShareButton  className='footer-share' title={`${tags.join(' ')} \r\n\n`} url={url} style={style}>
        <Icon.Twitter size={size}
                      color='#c4c1c9'
                      fill='#c4c1c9'
                      stroke='none'
                      alt={'twitter_button'}/>
    </TwitterShareButton>

export const Loader = ({screenHeight}) =>
    <IntersectingCirclesSpinner
    color='#2d2d2f'
    size={remap(screenHeight,568,2160,300,900,false)}/>

export const Logo = styled.div`
  margin: 3vh;
  font-size: 5vh;
`
export const swapViews = (state) =>
    state.isLoading?
    <DisplayView {...state}/>:
        state.resourceFound?
            <DisplayView {...state}/>:
            <PageNotFoundView {...state}/>




export const MainContainer = styled.div`
  display: grid;
  grid-template-rows: 0.2fr auto 0.2fr 0.05fr;
  //width: 100%;
  height: 100vh;
`

export const Container404 = styled.div`
  display: grid;
  grid-template-rows: 0.2fr auto 0.3fr;
  //width: 100%;
  height: 100vh;
`