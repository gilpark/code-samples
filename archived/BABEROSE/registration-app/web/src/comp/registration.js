import React , { useState,useRef }from 'react'
import {BabeLogo, Row3GridDiv} from "./layoutComps";
import logo from '../assets/babe_logo.png'
import close from '../assets/x.png'
import styled from "styled-components";
import KeyboardedInput from 'react-touch-screen-keyboard';

const FormWrapper = styled.div`
  margin-top: ${props => props.offset}vh;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  width: 60vw;
  transition: all 200ms;
`
const RegForm = styled.div`
  display: flex;
  flex-direction: column;
`
const InputLabel = styled.div`
  text-align: left;
  font-size: 4vh;
  background: none;
  margin-left: 0;
  color: ${props => props.valid?"#1D2972":"#ffffff"} !important;
`
const LabelWrapper = styled.div`
  width: 100%;
  font-size: 4vh;
  background: none;
  padding-top: 4vh;
`
const SubmitButton = styled.button`
  width: 100%;
  font-size: 5vh;
  background: #1D2972;
  color: white;
  height: 10vh;
  letter-spacing: 0.5vw;
  outline: 0;  
`
const TCWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  font-size: 2vh;
  background: none;
  display: flex;
  padding-top: 4vh;
  padding-bottom: 4vh;
`
const CustomMapping = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.com']
]

function Registration({ state, setState }) {
    const [firstName,setFirst] = useState('')
    const [lastName,setLast] = useState('')
    const [email,setEmail] = useState('')
    const [offset,setOffset] = useState(-6)
    const [firstChecked,setFirstCheck] = useState(true)
    const [lastChecked,setLasttCheck] = useState(true)
    const [emailChecked,setEmailtCheck] = useState(true)
    const [privacyChecked,setPrivacyCheck] = useState(true)
    const [isPrivacyOpen,setPrivacyOpen] = useState(false)
    const onSubmit = (e) => {
        let el = e.target
        let checkFirst = firstName !== ''
        let checkLast = lastName !== ''
        let checkEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        let canPass = checkFirst && checkLast && checkEmail && privacyChecked
        setFirstCheck(checkFirst)
        setLasttCheck(checkLast)
        setEmailtCheck(checkEmail)
        setPrivacyCheck(privacyChecked)
        if(canPass){
            setState(pre => ({...pre,path:'/select',data:{...pre.data,f:firstName,l:lastName,e:email}}))
        }else{
            el.classList.add('play-shake')
            setTimeout(()=>{el.classList.remove('play-shake')},600)
        }
    }
    return (
        <Row3GridDiv>
            <div>
                <BabeLogo src = {logo}/>
            </div>
            <FormWrapper offset={offset}>
                <div style={{fontSize:'8vh'}}>Registration</div>
                <RegForm>
                    <LabelWrapper>
                        <InputLabel valid={firstChecked}>{`First Name${firstChecked?"":"*"}`}</InputLabel>
                    </LabelWrapper>
                    <KeyboardedInput
                        inputClassName = {'k-input'}
                        value = {firstName}
                        type="text"
                        id="fname"
                        enabled
                        isDraggable={false}
                        onChange={value => setFirst(value)}
                        onBlur={() => setOffset(-6)}
                        onFocus={() => setOffset(-22)}
                        defaultKeyboard = {CustomMapping}
                    />
                    <LabelWrapper>
                        <InputLabel  valid={lastChecked}>{`Last Name${lastChecked ? "" : "*"}`}</InputLabel>
                    </LabelWrapper>
                    <KeyboardedInput
                        inputClassName = {'k-input'}
                        value = {lastName}
                        type="text"
                        id="lname"
                        enabled
                        isDraggable={false}
                        onChange={value => setLast(value)}
                        onBlur={() => setOffset(-6)}
                        onFocus={() => setOffset(-22)}
                        defaultKeyboard = {CustomMapping}
                    />
                    <LabelWrapper>
                        <InputLabel  valid={emailChecked}>{`Email${emailChecked ? "" : "*"}`}</InputLabel>
                    </LabelWrapper>
                    <KeyboardedInput
                        inputClassName = {'k-input'}
                        value = {email}
                        type="text"
                        id="email"
                        enabled
                        isDraggable={false}
                        onChange={value => setEmail(value)}
                        onBlur={() => setOffset(-6)}
                        onFocus={() => setOffset(-22)}
                        defaultKeyboard = {CustomMapping}
                    />
                    <TCWrapper>
                        <div  style={{
                            margin:'auto'
                        }}>
                            <input type='checkbox'
                                   name='thing'
                                   value='valuable'
                                   id="thing"
                                   checked={privacyChecked}
                                   onChange={e => {
                                       setPrivacyCheck(!privacyChecked)
                                   }}
                            />
                            <label htmlFor="thing"/>
                        </div>
                        <div style={{
                            fontFamily:'Arial',
                            letterSpacing: "-0.1vw",
                            paddingLeft:'1vw'
                        }} onClick={e => setPrivacyOpen(true)}>
                            {'Yes, I consent to BABE Wine and its affiliates providing me with product and marketing information by email and other electronic means and I have read and agree to '}
                            <u style={{
                                fontFamily:'Arial',
                                letterSpacing: "-0.1vw",
                            }}>{'the BABE PrivacyPolicy.'}</u>
                        </div>
                    </TCWrapper>
                    <SubmitButton type="submit" value="Submit" onClick={onSubmit} >
                        {'SUBMIT'}
                    </SubmitButton>
                </RegForm>
            </FormWrapper>
            <div/>
            <div style={{position:'absolute', width:"100vw", height:"100vh", textAlign:"left", display: isPrivacyOpen?"":"none"}}>
                <div style={{width:"60vw", height:"75vh", marginTop:"5vh",marginRight:"auto",marginLeft:"auto", background:"white", overflow:"auto", padding:'10vh'}}>
                    <img src={close} style={{position:"absolute", top:'8vh',right:'17vw'}} alt={"close button"} onClick={e => setPrivacyOpen(false)}/>
                    <h1 style={{fontSize:"6vh"}}>
                        Terms / Privacy
                    </h1>
                    <h1 style={{fontSize:"4vh"}}><b>TERMS OF USE</b></h1>
                    <p><span style={{fontWeight: "400px",lineHeight: "1.0px" }}>Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern drinkbabe.net's relationship with you in the context of this website.</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>The term "drinkbabe.net" or "us" or "we" refers to the owner of the website. The term "you" refers to the user or viewer of our website.</span>
                    </p>
                    <p></p>
                    <p><b>The use of this website is subject to the following terms of use:</b></p>
                    <p><span style={{fontWeight: "400px"}}>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>All trademarks reproduced in this website which are not the property of, or licensed to, the operator are acknowledged on the website.</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offence. From time to time, this website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).</span>
                    </p>
                    <p><span style={{fontWeight: "400px"}}>Your use of this website and any dispute arising out of such use of the website is subject to the laws of the United States.</span>
                    </p>
                    <br/>
                    <p><b>Wine-Specific Conditions</b></p>
                    <p><span style={{fontWeight: "400px"}}>Legal Requirements</span></p>
                    <p><b>You must be 21 years of age or older, to order or receive alcoholic beverages
                        from </b><b><span>drinkbabe</span><span>.net</span>. </b><span
                        style={{fontWeight: "400px"}}>Receipt of shipments containing alcoholic beverages requires the signature of a sober adult (a person 21 years of age or older who is not intoxicated).  Wines purchased from </span><span>drinkbabe.net</span> are
                        not for resale, and are for personal consumption only.</p>
                    <br/>
                    <p><b>Credit Card Charges</b></p>
                    <p><span style={{fontWeight: "400px"}}>Orders are by credit card only. We accept Visa, MasterCard, and American Express.</span>
                    </p>
                    <br/>
                    <p><b>Minimum Purchase</b></p>
                    <p><span style={{fontWeight: "400px"}}>No minimum purchase is required.</span>
                    </p>
                    <br/>
                    <p><b>States Authorized for Direct Shipment</b></p>
                    <p><span style={{fontWeight: "400px"}}>Due to the ever-changing nature of wine shipping laws, we may be able to ship wines, directly or indirectly, to all states except AL, AR, DE, IN, HI, MA, ME, MS, MT, NH, OK, RI, SD, UT.</span>
                    </p>
                    <br/>
                    <p><b>Shipping Costs</b></p>
                    <p><span style={{fontWeight: "400px"}}>UPS is DrinkBabe’s carrier of choice. Ground shipping is provided by UPS Ground at current market rates.</span>
                    </p>
                    <br/>
                    <p><b>Wine is a Delicate Commodity</b></p>
                    <p><span style={{fontWeight: "400px"}}>Wine is a perishable commodity. Wine does not like extremes of temperature: hot humid summer and cold winter weather may adversely affect the condition of your wine during shipment. </span><span>drinkbabe.net</span> is
                        not responsible for, and will not replace wine that is
                        damaged by extreme weather conditions during shipment. When
                        your wine order is picked up by the common carrier for
                        delivery, responsibility for the wine becomes the
                        responsibility of the purchaser.</p>
                    <br/><br/>
                    <h1 style={{fontSize:"4vh"}}><b>PRIVACY POLICY</b></h1>
                    <br/>
                    <p><span style={{fontWeight: "400px"}}>Protecting your privacy is important to us. We hope the following statement will help you understand how we collect, use and safeguard the personal information you provide to us on our site.</span>
                    </p>
                    <p><b>What kind of information do we collect from you
                        when you visit our site?</b></p>
                    <p><span
                        style={{fontWeight: "400px"}}>When you visit </span><span>drinkbabe.net</span>,
                        our stats package from Google collects some basic
                        information about your browser. Examples are things
                        like what type of browser and operating system are
                        you using; how long did you stay on our site; what
                        pages did you look at. This helps us understand how
                        visitors browse our site, so that we can make their
                        shopping experience better.</p>
                    <p><span style={{fontWeight: "400px"}}>We also collect personal information about you when you check out of our store such as your name, address, postal code, phone number, etc. We need this information to process payment and ship merchandise to you.</span>
                    </p>
                    <p><b>Sharing of personal information - we don't do it.</b></p>
                    <p><span style={{fontWeight: "400px"}}>Under no circumstances will we share any personal information that we collect with any third parties or web sites. All the information you give us is completely private and used solely for order processing and shipping. If you give us permission to send you marketing emails then we use your email for that purpose, but never does that email get sold or distributed to any other web site or list.</span>
                    </p>
                    <br/>
                    <p><b>III. Email Subscription Opt-Out.</b></p>
                    <p><span style={{fontWeight: "400px"}}>If you have chosen to opt into our newsletter or marketing emails and then decide to opt out, we have a simple “unsubscribe” and “update preferences” link at the bottom of every email that we send.</span>
                    </p>
                    <p><b>Consumer inquiries and privacy.</b></p>
                    <p><span style={{fontWeight: "400px"}}>If you have any questions about your privacy, or want to make changes to your profile, or get off our marketing list, simply send us an email.</span>
                    </p>
                    <p><b>Protecting your information.</b></p>
                    <p><span style={{fontWeight: "400px"}}>All the payment information we collect is done so under SSL - a standard internet security measure. Any data that we store about you is kept behind a secure firewall in our database and is not accessible to the public in any way.</span>
                    </p>
                </div>
            </div>
        </Row3GridDiv>
    )
}
export default Registration
