import React , { useState, useEffect }from 'react'
import styled from 'styled-components'

export const CenterDiv = styled.div`
  bottom: 0;
  height: auto;
  left: 0;
  margin: auto;
  position: absolute;
  top: 0;
  right: 0;
  width: 80vw;
`
export const Row3GridDiv = styled.div`
   display:grid;
   grid-template-rows: 12vh auto;
   height: 100vh;
   width: 100vw;
   text-align: center;
   //font-size: 5em;
`
export const BabeLogo = styled.img`
  height: auto;
  left: 0;
  position: absolute;
  top: 0;
  width: 7vw;
  padding: 3vh;
`
export const HashTagImg = styled.img`
  position: absolute;
  left: 40vw;
  width: 20vw;
  height: auto;
  bottom: 3vh;
`