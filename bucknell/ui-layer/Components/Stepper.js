import React, {useEffect, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles"
import { Step, StepGroup, Stepper, colors } from '@cimpress/react-components'
import logoSrc from '../assets/logo.png'
const useStyles = makeStyles((theme) => ({
   root_horizontal:{
       height:'40%',
       position: 'absolute',
       top: '40%',
       transform: 'translateY(-40%)',
       marginLeft:'20%'
   },
    root_vertical:{
        height:'40%',
        width:'80%',
        margin:'auto',
        paddingTop:'1vh',
        fontSize:'0.7rem'
    },
    logoWrapper:{
       bottom:0,
        // marginLeft:'-30%',
        position:'absolute',
        width:'100%',
        padding:'1.5rem',
        '& > img':{
           objectFit:'contain',
            width:'100%'
        }
    }
}))
export default function StepperComp({className, isVertical}) {
    const [activeStep,setStep] = useState(-1)
    const classes = useStyles()
    // useEffect(()=>{
    // },[])
    return (
       <div className={className}>
           <div className={isVertical?classes.root_vertical:classes.root_horizontal}>
               {/*<Stepper activeStep={activeStep} vertical={!isVertical}>*/}
               {/*    <Step*/}
               {/*        // onClick={setStep}*/}
               {/*        activeColor={'white'}*/}
               {/*          overrideBsStyle={'none'}*/}
               {/*    >*/}
               {/*        <div >Student Info</div>*/}
               {/*    </Step>*/}
               {/*    <Step*/}
               {/*        // onClick={setStep}*/}
               {/*          activeColor={'white'}*/}
               {/*          overrideBsStyle={'none'}*/}
               {/*    >*/}
               {/*        <div>Education</div>*/}
               {/*    </Step>*/}
               {/*    <Step*/}
               {/*        // onClick={setStep}*/}
               {/*          activeColor={'white'}*/}
               {/*          overrideBsStyle={'none'}*/}
               {/*    >*/}
               {/*        <div>Demographic</div>*/}
               {/*    </Step>*/}
               {/*    <Step*/}
               {/*        // onClick={setStep}*/}
               {/*          activeColor={'white'}*/}
               {/*          overrideBsStyle={'none'}*/}
               {/*    >*/}
               {/*        <div>Confirm</div>*/}
               {/*    </Step>*/}


               {/*</Stepper>*/}
           </div>
           {!isVertical&&
           <div className={classes.logoWrapper}>
               <img src={logoSrc} alt={'bucknell-logo'}/>
           </div>
           }

       </div>
    )
}