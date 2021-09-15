import React, {useCallback, useEffect, useRef, useState} from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel'
import { makeStyles } from '@material-ui/core/styles'
import f from '../Utils/functional.es'
import jsonPath from '../Utils/JsonPath'
import playBtnSrc from '../assets/playbutton.png'
import BarLoader from "react-spinners/BarLoader"
import {useRecoilState} from "recoil"
import {categoryTitle} from "../States/states"
import {IfElseThen} from "./IfElseThen"
import {galleryIndex, playcanvasReady} from "../Pages/api"
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'

const useStyles = makeStyles((theme) => ({
}))

const images = [
    {
        original: 'https://picsum.photos/id/1018/1000/600/',
        thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
        original: 'https://picsum.photos/id/1015/1000/600/',
        thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
        original: 'https://picsum.photos/id/1019/1000/600/',
        thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
];

export const GalleryView = React.memo(({manifest, isMobile, categoryIdx}) => {
    const [isLoading, setLoading] = useState(false)
    const [itemIndex,setIndex] = useRecoilState(galleryIndex)
    const [masterArr, setMasterArr] = useState([])
    const [currentItems, setCurrentItems] = useState([])
    const [title, ] = useRecoilState(categoryTitle)
    const classes = useStyles({mobile:isMobile,isLoading:isLoading})

    useEffect(()=>{
        if(!manifest) return
        const galleries =  f.range(0,11).map(idx =>
            jsonPath(manifest[idx], `$.entries[1].data`)[0] || [])
        setMasterArr(galleries)
    }, [manifest])

    useEffect(()=>{
        if(!masterArr[categoryIdx]) return
        const availableItems = masterArr[categoryIdx].filter(d => d.title)
            .filter(d => d.value_type==='image')
            .map(d => ({original:d.value, thumbnail:d.value}))
        setTimeout(()=>{
            setCurrentItems(availableItems)
        },500)
    },[masterArr[categoryIdx]])

    useEffect(()=>{
        if(masterArr.length < 1) return
        if(masterArr[categoryIdx]) setCurrentItems(masterArr[categoryIdx].filter(d => d.title))
        setIndex(0)
    }, [categoryIdx])
    return (
        <>
            <ImageGallery items={currentItems}
                          slideDuration={0}
                          showFullscreenButton={false}
                          showPlayButton={false}
            />
        </>
    )
})
