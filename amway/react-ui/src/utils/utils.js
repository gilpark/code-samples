export function isParams(params, appname) {
  return (params.imgId !== undefined && params.imgId !== "" )
      && ['xs','beauty','icook','nutrition'].includes(appname.toLocaleLowerCase())
}
export function checkImagesReady(gifRes, imgRes, gifReq , imgReq ){
  return {
    start: function (listener ) {
      listener.next(imgReq) //send initial request
      listener.next(gifReq) //send initial request
      this.imgLis = {
        next : (x) => {
          if(x instanceof Error){
            console.log("img not found send another req", x)
            setTimeout(() =>listener.next(imgReq),5000)
          }
        },error : (err) => {}, complete : () => {}
      }
      this.gifLis = {
        next : (x) => {
          if(x instanceof Error){
            console.log("gif not found send another req", x)
            setTimeout(() =>listener.next(gifReq),5000)
          }else
            listener.complete()
        },error : (err) => {},complete : () => {}
        //listener.error(e)  //listener.complete()
      }
      gifRes.addListener(this.gifLis)
      imgRes.addListener(this.imgLis)
    },
    stop: function () {
      gifRes.removeListener(this.gifLis)
      imgRes.removeListener(this.imgLis)
      console.log("gif found!")
    },
    imgLis : {},
    gifLis : {}
  }
}
