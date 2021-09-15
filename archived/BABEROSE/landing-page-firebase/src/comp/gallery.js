import React, {useEffect, useState, Component, useRef, ReactPortal } from 'react';
//https://res.cloudinary.com/demo/image/upload//w_200/lady.jpg
import ReactBnbGallery from 'react-bnb-gallery'
import 'react-bnb-gallery/dist/style.css'
import {DlButtonSM, FbButtonSM, TwButtonSM} from "./small-comps";
import styled from "styled-components";
import {Portal} from './usePortal'

//test photos
const photos = [{
    photo: "https://res.cloudinary.com/facepaint/image/upload/v1578091021/BABE/gbg.gif",
    number:0,
    // caption: "Viñales, Pinar del Río, Cuba",
    // subcaption: "Photo by Simon Matzinger on Unsplash",
    thumbnail: "https://res.cloudinary.com/facepaint/image/upload/pg_1/w_200/v1578091021/BABE/gbg.gif",
}, {
    photo: "https://res.cloudinary.com/facepaint/image/upload/v1578596579/babe/stsftvz4dypzol1w90iq.gif",
    number:1,
    // caption: "La Habana, Cuba",
    // subcaption: "Photo by Gerardo Sanchez on Unsplash",
    thumbnail: "https://res.cloudinary.com/facepaint/image/upload/pg_1/w_200/v1579018017/babe/stsftvz4dypzol1w90iq.gif",
}, {
    photo: "https://res.cloudinary.com/facepaint/image/upload/v1579018017/babe/qdcnzn1fgescfni8mlck.gif",
    number:2,
    // caption: "Woman smoking a tobacco",
    // subcaption: "Photo by Hannah Cauhepe on Unsplash",
    thumbnail: "https://res.cloudinary.com/facepaint/image/upload/pg_1/w_200/v1579018017/babe/qdcnzn1fgescfni8mlck.gif",
}];

const ShareButtonWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  z-index: 3000;
  right: 2.5em;
  top: 0;
`

export function GalleryView(state){
    const [galleryOpened,setGalleryOpen] = useState(false)
    const [currentID,setCurrent] = useState("")
    const toggleGallery = () => setGalleryOpen(!galleryOpened)
    const galleryRef = useRef()
    const shareURL = (id) => `https://babe-landing.herokuapp.com/user/${id}`
    const downloadURL = `https://res.cloudinary.com/facepaint/image/upload/v1578596579/babe/${currentID}.gif`

    const shareButtons =
        <ShareButtonWrapper>
            <FbButtonSM tag={'#NNTEST'} url={shareURL(currentID)} size = {50}/>
            <TwButtonSM tags={['#NNTEST','#NNTEST2']} url={shareURL(currentID)} size = {50}/>
            <DlButtonSM filename={'test.gif'} url={downloadURL} size = {50}/>
        </ShareButtonWrapper>
    let portalProps = {id:'.gallery-modal--content',children:shareButtons}

    useEffect(()=>{
        if(!galleryOpened)return
        const mainImage = document.querySelector('.media-image')
        setCurrent(mainImage.src.split('/').pop().replace('.gif',''))
        const config = { attributes: true }
        const callback = function(mutationsList, observer) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    setCurrent(mainImage.src.split('/').pop().replace('.gif',''))
                }
            }
        }
        const observer = new MutationObserver(callback);
        observer.observe(mainImage, config)
        return () => {
            observer.disconnect()
        }
    }, [galleryOpened, currentID])
    return(
        <div>
            <button onClick={toggleGallery}>Open photo gallery</button>
            <ReactBnbGallery show={galleryOpened} photos={photos}
                             onClose={toggleGallery}
                             ref = {galleryRef}
            />
            {galleryOpened?<Portal {...portalProps}/>:null}
        </div>
    )
}
