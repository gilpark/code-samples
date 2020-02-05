import React from "react";
import {Logo, Container404} from './small-comps.js';
import styled from "styled-components";

const ContentsWrapper = styled.div`
text-align: center;
justify-self: center;
align-self: center;
font-size: 5vh;
`

const HeadLineWrapper = styled.div`
  font-size: 8vh;
  padding-bottom: 3vh;
`

export default function PageNotFoundView(prop) {
    return(
        <Container404>
            <Logo>{'LOGO'}</Logo>
            <ContentsWrapper>
                <HeadLineWrapper>Page Not Found</HeadLineWrapper>
               {'The page you were looking for doesn\'t exist'}
            </ContentsWrapper>
            <div/>
        </Container404>
    )
}
