import React from "react";
import styled from 'styled-components'
import {
    Loader,
    Logo,
    FbButton,
    DlButton,
    TwButton,
    MainContainer
} from './small-comps.js';
import appConfig from '../appConfig'

const ShareButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: #2d2d2f;
`
const ContentsWrapper = styled.div`
  text-align: center;
  justify-self: center;
   align-self: center;
`
const HeadLineWrapper = styled.div`
  font-size: 8vh;
`
const UserImage = styled.img`
  height: 60vh;
  border-radius: 50%;
`
export default function DisplayView(state) {
    const thisURL = `${appConfig.landingPageBaseURL}/${state.assetID}`
    const fbTag = '#BABEDOESAMERICA'
    const twTags = ['#BABEDOESAMERICA']
    let filename = `${state.assetID}.gif`
    return (
        <MainContainer>
            <Logo>{'LOGO'}</Logo>
            <ContentsWrapper>
                <HeadLineWrapper>HEAD LINE GOES HERE</HeadLineWrapper>
                {state.isLoading?
                    <Loader screenHeight = {window.screen.height} /> :
                    <UserImage src={state.imageURL} alt={`user-upload-${filename}`}/>}
            </ContentsWrapper>
            <ShareButtonWrapper>
                <FbButton tag={fbTag} url={thisURL} screenHeight = {window.screen.height}/>
                <TwButton tags={twTags} url={thisURL} screenHeight = {window.screen.height}/>
                <DlButton filename={filename} url={state.imageURL} screenHeight = {window.screen.height}/>
            </ShareButtonWrapper>
            <ContentsWrapper style={{fontSize:'2vh'}}>
                {'© COPYRIGHT TEXT HERE'}
            </ContentsWrapper>
        </MainContainer>
    )
}
