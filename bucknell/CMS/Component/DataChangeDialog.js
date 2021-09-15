import React, {useEffect, useState} from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export default function DataChangeDialog({onClose, onConfirm}) {
    const handleOnConfirm =  (e) => {
        e.preventDefault()
        if(onConfirm) {
            onConfirm()
        }
    }
    const handleClose = () => {
        if(onClose)onClose()
    }
    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle id="alert-dialog-slide-title">{'Unsubmitted data warning'}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    do you want to discard changes?
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <Button onClick={handleOnConfirm} color="default">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}