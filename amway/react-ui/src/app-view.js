import {h} from "@cycle/react"
import React from 'react'
import {
  FacebookShareButton,
  TwitterShareButton,
} from 'react-share'

const FBButton = (url, tag = '#test') =>
    <div className={'fb'}>
      <FacebookShareButton  url={url} hashtag={tag}  >
        {/*<FacebookIcon size={32} round={true} />*/}
        <img className={'btn'} src = 'assets/icon_Facebook.png'/>
      </FacebookShareButton>
    </div>
const TWButton = (url, tags = ["#test","#test2"]) =>
    <div className={'tw'}>
      <TwitterShareButton title={`${tags.join(' ')} \r\n\n`} url={url}>
        {/*<TwitterIcon size={32} round={true}/>*/}
        <img className={'btn'} src = 'assets/icon_Twitter.png'/>
      </TwitterShareButton>
    </div>


export function pageNotFoundView(checkURL$) {
  return checkURL$.map(x =>{
    if(x instanceof Error){
      return makeGridlayout([
        h('div',{className: 'p404'},'404'),
        h('div',{className: 'p404text'},'PAGE NOT FOUND'),
        h('img', {src: './assets/Amway_A60_logo.png', className: 'p404img'})
      ])
    }
  })
}
export function responseView(response$,appName) {
  let getDisplayName = (name) =>{
    switch (name) {
      case 'xs': return '#LIVEXS'
      case 'beauty': return '#ARTISTRYSTUDIO'
      case 'icook': return '#AMWAYICOOK'
      case 'nutrition': return '#NUTRILITE'
      default : return '#AmwayA60'
    }
  }
  let appDisplayName = getDisplayName(appName)
  return response$.map(([imageRes,gifRes]) => {
    let imgPath = imageRes instanceof Error ? "./assets/loading.gif" : URL.createObjectURL(imageRes.body)
    let gifPath = gifRes instanceof Error ? "./assets/loading.gif" : URL.createObjectURL(gifRes.body)
    return makeGridlayout([
      h('div', {className: 'header_wrapper'}, [
        h('div', {className: "header_l"}, "#AmwayA60"),
        h('div', {className: "header_r"}, appDisplayName),
      ]),
      h('div', {className: 'content_wrapper'}, [
        h('div', {className: 'image_container'}, [
          h('div', {className: 'image_btn_wrapper'}, [
            h('img', {src: gifPath}),
            h('div', {className : 'button_wrapper'}, [
              h('div', {className : 'button_wrapper_inner'}, [
              FBButton(window.gifPath, appDisplayName),
              TWButton(window.gifPath, [appDisplayName,'#AmwayA60']),
              h('a', {href: gifPath, download: `${appDisplayName}.gif`}, [
                h('img', {className : 'btn',src: './assets/icon_Download.png'})
              ])
            ])
            ])
          ])
        ]),
        h('div', {className: 'image_container'}, [
          h('div', {className: 'image_btn_wrapper'}, [
            h('img', {src: imgPath}),
            h('div', {className : 'button_wrapper_right'}, [
              h('div', {className : 'button_wrapper_inner_right'}, [
              h('a', {href: imgPath, download: `${appDisplayName}.png`}, [
                h('img', {className : 'btn',src: './assets/icon_Download.png'}),
              ]),
              ])
            ]),
          ])
        ])
      ]),
      h('div', {className: 'logo_container'}, [
        h('img', {src: './assets/Amway_A60_logo.png'}),
      ]),
    ])
  })
}
const grid_container = {width : '100vw',  display: 'grid', gridTemplateColumns: '0.5fr 2fr 0.5fr'}
export function makeGridlayout(child, style = grid_container) {
  return h('div',{className : 'grid'}, [
    h('div', ),
    h('div',child),
    h('div',),
  ])
}

