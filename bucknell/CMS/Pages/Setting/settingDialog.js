import React, {useEffect, useState} from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import { useForm, useFieldArray} from "react-hook-form"
import {makeStyles} from "@material-ui/core/styles";
import {validateEmail} from "./api/state";
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    title:{
        fontFamily:'TradeGothic',
        '&>h2':{
            fontFamily:'TradeGothic',
        }
    },
    dialogWindow:{
        minWidth:'500px',
        width:'60vw'
    },
    itemWrapper:{
        display: 'flex',
        flexDirection:'row',
        margin:'1rem',
    },
    item:{
        margin:'1rem',
        maxWidth:'40%',
        '& > div':{
            marginTop:'0.3rem'
        },
        '& label':{
            color: 'black',
            // fontFamily: 'FreigSanProSem',
            fontSize:'0.9rem',
            letterSpacing: '0.06rem',
            marginBottom:'1rem'
        },
        '& input[type=text]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(1,1,1,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& input[type=password]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(1,1,1,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& input[type=tel]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(1,1,1,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white',

        },
        '& input[type=email]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(1,1,1,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& select':{
            color:'white',
            border : 'none',
            outline:'none',
            height: '2.5rem',
            background: 'rgba(1,1,1,0.3)',
            padding:'0.3rem',
            minWidth:'13rem',
        },
        '& select option':{
            color:'white',
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgb(0,56,101)',

        },
        '& input:focus':{
            outline: '2px solid white'
        },

    },
    error:{
        color:'red',
        fontSize:'0.8rem',
        fontFamily:'FreigSanProSem'
    }
}))
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})


const SettingDialog= React.memo(({open,setOpen,addUser})=> {
    const { register, handleSubmit, watch, errors,control,reset } = useForm()
    const {email, password} = watch()
    const AddTitle = 'Adding new user'
    const classes = useStyles()
    useEffect(()=>{
        reset()
    },[])
    const onSubmit = d => {
        const {email, displayName, role, password} = d
        setOpen(false)
        addUser(email, displayName, role,password)
            .then(_=>{
                reset()
                // setOpen(false)
            })
            .catch(window.alert)
    }
    const handleClose = ()=>{
        reset()
        setOpen(false)
    }
    const emailErrorMsg = errors.email && errors.email.type==='required'? "email is required" : 'the email address is not acceptable'
    return (

        <Dialog
            classes={{paper:classes.dialogWindow}}
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
            maxWidth={'md'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className={classes.root} id="setting-form">
            <DialogTitle id="alert-dialog-slide-title" className={classes.title}>{AddTitle}</DialogTitle>
            <DialogContent>

                <div className={classes.itemWrapper}>
                    <div className={classes.item}>
                        <label>Email address</label>
                        <input type={'email'}
                               name={'email'}
                               ref={register({required: true, validate:validateEmail})}
                        />
                        {errors.email&&
                        <p className={classes.error}>{emailErrorMsg}</p>}
                    </div>
                    <div className={classes.item}>
                        <label>Confirm Email</label>
                        <input
                            type={'email'}
                            name={'email2'}
                            ref={register({required: true, validate:d => d === email})}
                        />
                        {errors.email2&&
                        <p className={classes.error}>{'email address dont match'}</p>}
                    </div>
                </div>
                <div className={classes.itemWrapper}>
                    <div className={classes.item}>
                        <label>UserName</label>
                        <input
                            type={'text'}
                            name={'displayName'}
                            ref={register({required: true, validate:d => d.length > 1})}
                        />
                        {errors.displayName&&
                        <p className={classes.error}>{'required'}</p>}
                    </div>
                    <div className={classes.item}>
                    <label>User role</label>
                    <select
                        name={'role'}
                        ref={register()}
                    >
                        <option value={'author'}>Author</option>
                        <option value={'admin'}>Admin</option>
                    </select>
                </div>
                </div>
                <div className={classes.itemWrapper}>
                    <div className={classes.item}>
                        <label>Password</label>
                        <input
                            type={'password'}
                            name={'password'}
                            ref={register({required: true, validate:d => d.length > 6})}
                        />
                        {errors.password&&
                        <p className={classes.error}>{'minimum of 6 characters required'}</p>}
                    </div>
                    <div className={classes.item}>
                        <label>Confirm Password</label>
                        <input
                            type={'password'}
                            name={'password2'}
                            ref={register({required: true, validate:d => d === password})}
                        />
                        {errors.password2&&
                        <p className={classes.error}>{'required'}</p>}
                    </div>
                </div>

            </DialogContent>
            <DialogActions>
                {/*<input type={'submit'}>submit</input>*/}
                <Button
                    onClick={handleClose}
                    color="default">
                    Cancel
                </Button>
                <Button
                    form = "setting-form"
                    type ="submit"
                    color="default">
                    Confirm
                </Button>
            </DialogActions>
        </form>
        </Dialog>
    )
})

export default SettingDialog