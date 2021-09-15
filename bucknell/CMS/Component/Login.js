import React, { useEffect, useState } from "react"
import {useForm} from "react-hook-form"
import {ErrorMessage} from "@hookform/error-message"
import {useHistory} from "react-router-dom"
import makeStyles from "@material-ui/core/styles/makeStyles"
import createStyles from "@material-ui/styles/createStyles"
import logoSrc from '../assets/logo.png'
import {Button} from "@material-ui/core"
import withStyles from "@material-ui/styles/withStyles"
import { IsLoadingHOC } from "./isLoading"
import routes from "../routes";
import {useCategories} from "../Pages/Entry/api/state";

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


const useStyles = makeStyles((theme) => createStyles({
    root:{
        background: 'rgb(0,56,101)',
        width:'100vw',
        height:'100vh',
        display:'grid',
        gridTemplateColumns:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr)',
        gridTemplateRows:'minmax(2rem, 1fr) minmax(auto, 65ch) minmax(2rem, 1fr)',
        fontFamily:'FreigSan Pro Sem',
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
        margin:'auto',

        '& > div':{
            marginTop:'0.3rem'
        },

        '& input[type=email]':{
            width:'97%',
            border : '5px',
            outline:'none',
            height: '2rem',
            background: 'rgba(255,255,255,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& input[type=password]':{
            width:'97%',
            border : '5px',
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
        maxWidth:'200px',
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

const LoginForm = React.memo((props)=>{
    const {loginCallback } = props
    const { register, handleSubmit, watch, errors, control } = useForm()
    const history = useHistory()
    const classes = useStyles({})
    const {categories, isLoading, error}  = useCategories()
    // useEffect(()=>setLoadingState(false),[])

    const onSignIn =(d) => {
        // setLoadingState(true)
        const firstCategoryID = categories[0].uid
        const {email, password} = d
        loginCallback(email, password)
            .then((r)=> {
                // setLoadingState(false)
                history.push(`${routes.pages.mediaLibrary}`)
            }).catch(window.alert)
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
                        <input
                            placeholder={'Password'}
                            autoComplete={"true"}
                            name={'password'}
                            type={"password"}
                            ref={register({ required: true, validate:pw => pw.length>6 })}
                        />
                        <ErrorMessage errors ={errors}
                                      className={'error'}
                                      name={'password'} as={'p'}
                                      message={errors.email?.type==='required'?`* This is required`:
                                          'password needs be longer than 6 characters'}/>
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
// export default IsLoadingHOC(LoginForm)
