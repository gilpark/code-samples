import React, { useEffect, useState } from "react"
import {Login, validateEmail} from "../Pages/api"
import {useForm} from "react-hook-form"
import {ErrorMessage} from "@hookform/error-message"
import {useHistory} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import createStyles from "@material-ui/styles/createStyles";
import logoSrc from '../assets/logo.png'
import {Button} from "@material-ui/core";
import withStyles from "@material-ui/styles/withStyles";

const useStyles = makeStyles((theme) => createStyles({
    root:{
        background: 'rgba(0,56,101,1)',
        width:'100vw',
        height:'100vh',
        display:'grid',
        gridTemplateColumns:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr)',
        gridTemplateRows:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr)',
    },
    form: {
        gridColumn:'1/4',
        gridRow:'2/3',
        justifySelf:'center',
        display: 'flex',
        flexDirection:'column',
    },
    title:{
        color:'white',
        textAlign:'center',
        fontSize:'3rem',
        width:'100%',
        fontFamily:'TradeGothic'
    },
    itemWrapper:{
        display: 'flex',
        flexDirection:'column',
        margin:'1rem',
    },
    item:{

        width:'100%',
        maxWidth:'300px',
        fontFamily:'FreigSan Pro Medium',
        '& > div':{
            marginTop:'0.3rem'
        },

        '& input[type=email]':{
            width:'100%',
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(255,255,255,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& input:focus':{
            outline: '2px solid white'
        },
    },
    itemLogo:{
        padding:'3rem',
        width:'100%',
        maxWidth:'300px',
    },
    buttonWrapper:{
        display: 'flex',
    },
    logo:{
        width:'100%',
        maxWidth:'300px',
        margin:'auto'

    }
}))
const RegisterButton = withStyles((theme) => ({
    root: {
        color: 'black',
        fontFamily:'FreigSan Pro Medium',
        backgroundColor: 'rgb(255,255,255)',
        '&:hover': {
            backgroundColor: 'rgb(255,191,0)',
        },
    },
}))(Button)
const SubmitButton = withStyles((theme) => ({
    root: {
        color: 'white',
        width:'100%',
        fontFamily:'FreigSan Pro Medium',
        backgroundColor: 'rgb(255,153,0)',
        '&:hover': {
            backgroundColor: 'rgb(255,191,0)',
        },
    },
}))(Button)
const LoginForm = React.memo(({setUser})=>{
    const { register, handleSubmit, watch, errors, control } = useForm()
    const history = useHistory()
    const classes = useStyles({})
    const onSignIn =(d) => {
        Login(d.email)
            .then(r=>r.json())
            .then(r =>{
                if(r.error){
                    window.alert(r.error)
                    return
                }
                setUser(r.data)
            })
    }
    return (
        <div className={classes.root}>
            <form onSubmit={handleSubmit(onSignIn)} className={classes.form}>
                <div className={classes.itemWrapper}>
                    <div className={classes.title}>
                        {`Sign in`}
                    </div>
                </div>
                <div className={classes.itemWrapper}>
                    <div className={classes.item} >
                        <input
                            placeholder={'Email'}
                            autoComplete={"true"}
                            name={'email'}
                            type={"email"}
                            ref={register({ required: true,validate:validateEmail })}
                        />
                        <ErrorMessage errors ={errors}
                                      className={'error'}
                                      name={'email'} as={'p'}
                                      message={errors.email?.type==='required'?`* This is required`:
                                          'this email address not acceptable'}/>
                    </div>
                </div>
                <div className={classes.itemWrapper}>
                    <div className={classes.item} >
                        <SubmitButton
                            variant="contained"
                            fullWidth={true}
                            type={'submit'}>{"Sign in"}</SubmitButton>
                    </div>
                </div>
                <div className={classes.itemWrapper}>
                    <div className={classes.item} >
                        <RegisterButton
                            variant="contained"
                            fullWidth={true}
                            onClick={()=>{history.push('/')}}>{"Register"}</RegisterButton>
                    </div>
                </div>
                <div className={classes.itemWrapper}>
                    <div className={classes.itemLogo} >
                        <img className={classes.logo}
                             src={logoSrc} alt={'bucknell-logo'}/>
                    </div>
                </div>
            </form>
        </div>
    )
})

export default LoginForm