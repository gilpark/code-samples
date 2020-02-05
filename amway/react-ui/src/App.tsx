import React from "react"
import xs, {Stream} from 'xstream'
import  queryString from 'query-string'
import {isParams,checkImagesReady} from "./utils/utils"
import {responseView,pageNotFoundView,makeGridlayout} from "./app-view"
import {h} from "@cycle/react"
const baseCloudinaryURL = '##########################'

export function main (sources : any) {
    const appName = window.location.pathname.replace("/","").toLowerCase()
    const parsed = queryString.parse(location.search)
    // @ts-ignore
    const checkURL$ = xs.of({parsed,appName}).map(({parsed,appName}) => {
        let params = parsed
        let appname = appName
        console.log(isParams(params,appname), "check url")
        return isParams(params,appname)? xs.never(): xs.of(new Error("params not provided"))
    }).flatten()

    const errObj = (res: any) => res.replaceError(() => xs.of(new Error('cannot fetch data!')))
    const imgRes$ = sources.http.select('image').map(errObj).flatten()
    const gifRes$ = sources.http.select('gif').map(errObj).flatten()
    const request$ = xs.of({parsed,appName}).map(({parsed,appName}) => {
        let params = parsed
        let appname = appName
        let imgReq ={
            url: `${baseCloudinaryURL}/${appname}/${params.imgId}.png`,
            category: 'image',
            responseType : 'blob'
        }
        let gifReq = {
            url: `${baseCloudinaryURL}/${appname}/gif-${params.imgId}.gif`,
            category: 'gif',
            responseType : 'blob'
        }
        // @ts-ignore
        window.gifPath = gifReq.url;
        console.log(isParams(params,appname), "request")
        return isParams(params,appname)?  xs.create(checkImagesReady(gifRes$,imgRes$,gifReq,imgReq)) : xs.never()
    }).flatten()

    const response$ = xs.combine(imgRes$,gifRes$).map(x => [x[0],x[1]])
    const wrongParamView$ = //pageNotFoundView(checkURL$)
        checkURL$.map(x =>{
        if(x instanceof Error){
            return makeGridlayout([
                h('div',{className: 'p404'},'404'),
                h('div',{className: 'p404text'},'PAGE NOT FOUND'),
                h('img', {src: './assets/amway_logo.png', className: 'p404img'})
            ])
        }
    })
    const responseView$ = responseView(response$, appName)
    const view$ = xs.merge(wrongParamView$,responseView$)
    return {
        react: view$,
        http : request$,
        test : xs.periodic(1000)
    }
}