import React, {useEffect, useRef, useState} from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel'
import { makeStyles } from '@material-ui/core/styles'
import f from '../Utils/functional.es'
import jsonPath from '../Utils/JsonPath'
import playBtnSrc from '../assets/playbutton.png'
import BarLoader from "react-spinners/BarLoader";
import useKeyPress from "../Hooks/useKeyPress";

const useStyles = makeStyles((theme) => ({
    icons:{
        width:'3rem',
        height:'3rem',
    },
    itemWrapper:{
        maxHeight:'70vh'
    },
    video:{
        width:'100%',
        height:'auto'
    },
    loadingWrapper:{
        position:'fixed',
        top:'40vh',
        left:'25vw',
        '&> div> div':{
            background:'rgba(255,255,255,0.7)',
            borderRadius:'1rem'
        },
        '&> div':{
            borderRadius:'1rem'
        }
    },
    galleryWrapper:{
        opacity:p=>p.isLoading?'0':'1',
        transition: 'opacity 0.5 ease-in',
        marginTop:'3rem'
    },
    titleWrapper:{
        position:'absolute',
        top:'1vh',
        width:'400px',
        left:'50%',
        marginLeft:'-200px',
        padding:'20px'
    },
    categoryTitle:{
        color:'white',
        fontSize:'1.2rem',
        textAlign:'center',
        fontFamily: 'FreigSan Pro Medium'
    }
}))



export const GalleryView360 = React.memo(({manifest, isMobile, categoryIdx}) => {
    const [isLoading, setLoading] = useState(true)
    const [itemIndex,setIndex] = useState(0)
    const [masterArr, setMasterArr] = useState([])
    const [currentItems, setCurrentItems] = useState([])
    const videoRefs = useRef([])
    const [categoryTitles, setCategoryTitles] = useState([])
    const classes = useStyles({mobile:isMobile,isLoading:isLoading})

    useEffect(()=>{
        if(manifest){
            const galleries =  f.range(0,10).map(idx => {
                return jsonPath(manifest[idx], `$.entries[0].data`)[0] || []
            })
            setMasterArr(galleries)
            setCurrentItems(galleries[categoryIdx].filter(d => d.title))
            setCategoryTitles(manifest
                .map(_=>({title:_.category_title.replace('/',' / '),index:_.category_index})))
        }

    }, [manifest])
    useEffect(()=>{
        if(masterArr.length < 1) return
        setCurrentItems(masterArr[categoryIdx].filter(d => d.title))
    }, [categoryIdx])

    const customRenderThumb = (children) =>
        currentItems.map((item,idx) => {
            const {value, title, value_type} = item
            const url =item.thumbnail_url
            const imgStyle = {
                objectFit: 'cover',
                maxHeight: '3rem',//todo on mobile?
                maxWidth:'5rem',
                width:'auto',
                display:'block',
                margin:'auto',
                opacity: '0.7'
            }
            const wrapper = {
                maxHeight: '3rem',//todo on mobile?
                maxWidth:'5rem',
                minWidth:'5rem',
                width:'auto',
                background:`url(${url})`,
                backgroundSize:'contain'
            }
            const onLoaded = (input) => {
                const isLastItem = currentItems.length-1 === idx
                if (!input) return
                const img = input
                const updateFunc = () => {
                    if(isLastItem){
                        setLoading(false)
                        console.log('all images loaded')
                    }
                }
                img.onload = updateFunc
                if (img.complete) { updateFunc()}
            }
            const VideoItem = () =>{
                return(
                    <div style={wrapper}>
                        <img src={playBtnSrc}
                             ref={onLoaded}
                             style={imgStyle} />
                        {/*<img  src={url} style={vidStyle}/>*/}
                    </div>
                )
            }
            return <VideoItem key={idx} />
        })

    const galleryItem = (data,idx) =>{
        const {value, title, value_type, thumbnail_url, ios_url, stream_url} = data
        const hide = itemIndex !== idx
        const imgStyle = {
            objectFit: 'contain',
            display:hide?'none' : '',
            maxHeight:'50vh'//todo on mobile
        }

        const Item = () => <img key={idx} src={thumbnail_url}
                              className={classes.itemWrapper}
                              style={imgStyle}/>
        return (<Item key={idx}/>)
    }
    const onIndexChange = idx =>{
        if(idx !== itemIndex) setIndex(idx)
    }

    return (
        <>
            <div className={classes.titleWrapper}>
                <div className={classes.categoryTitle}>
                    {categoryTitles[categoryIdx]&&categoryTitles[categoryIdx].title}
                </div>
            </div>
            <div className={classes.galleryWrapper}>
                <Carousel showArrows={false} dynamicHeight={true}
                          onChange={onIndexChange}
                          // selectedItem={itemIndex}
                          infiniteLoop
                          showStatus={false}
                          transitionTime={100}
                          renderThumbs={customRenderThumb}
                >
                    {currentItems.map(galleryItem)}
                </Carousel>
            </div>
            {isLoading&&
            <div className={classes.loadingWrapper}>
                <BarLoader
                    loading={isLoading}
                    height={'1vh'}
                    width={'50vw'}
                />
            </div>
            }

        </>

    )
})
