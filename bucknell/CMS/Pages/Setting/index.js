import React, {useCallback, useEffect, useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {useRecoilState} from "recoil"
import { useParams, useHistory} from "react-router-dom"
import CreateHeader from "../../Component/Header/CreateHeader"
import {ArrowBack, Check, Add, DeleteForever} from '@material-ui/icons'
import Fab from "@material-ui/core/Fab"
import {entryUpdateFlag} from "../Entry/api/state"
import {userMultiSelect, useUsers} from "./api/state"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import Checkbox from "@material-ui/core/Checkbox"
import ListItemText from "@material-ui/core/ListItemText"
import List from "@material-ui/core/List"
import SettingDialog from "./settingDialog"
import {functional as f} from '../../utils/functional.es'
import IconButton from "@material-ui/core/IconButton";
import PeopleIcon from "@material-ui/icons/People";
import {Typography} from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth:'1000px'
    },
    main:{
        paddingTop:'100px'
    },
    preview:{
        objectFit:'cover',
        width:'auto',
        maxHeight: '400px',
        maxWidth:'500px',
        height:'auto'
    },
    icons:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        color:'white'
    },
    deleteIcons:{
        maxHeight: "3rem",
        maxWidth: "3rem",
        color:'#F47521'
    },
    title:{
        marginTop:'1.2rem',
        display:'flex',
        color:'white'
    },
    titleText:{
        fontFamily:'TradeGothic'
    },
    titleIcon:{
        color:'white',
        width:'2.8rem',
        height:'2.8rem',
        // marginTop:'0.5rem',
        marginRight:'1rem'
    },
    tierStyle:{
        textAlign:'end',
        color:'white',
        marginRight:'1rem'
    },
    controlWrapper:{
        marginTop:'1.2rem',
    },
    checkBox:{
        color:'white'
    },
    listText:{
        color:'white',
        '&>p':{
            color:'rgba(255,255,255,0.5)',
        }
    }
}))

const Header = React.memo((props)=>{
    const classes = useStyles()
    const history = useHistory()
    const { deleteUser, addUser, setOpen} = props
    const [updateFlag,setUpdateFlag] = useRecoilState(entryUpdateFlag)
    const [selectedUsers,setSelected] = useRecoilState(userMultiSelect)

    const handleDelete =  () =>{
        f.go(
            selectedUsers,
            f.map(d => ({uid:d.uid,email:d.email})),
            f.mapC(deleteUser)
        ).then(_=> setSelected([]))
            .catch( window.alert)
    }
    const Title  = () =>(
        <div className={classes.title}>
            <PeopleIcon
                className={classes.titleIcon}
                fontSize="inherit" />
            <Typography
                className={classes.titleText}
                variant={'h4'}
            >{'Users'}</Typography>
        </div>
    )
    const Controls = () =>(
        <div className={classes.controlWrapper}>
            {selectedUsers.length>0 &&
            <IconButton color={updateFlag?'primary':'default'} aria-label="delete"
                 onClick={handleDelete}
                 className={classes.deleteIcons}>
                <DeleteForever />
            </IconButton>
            }
            <IconButton color={updateFlag?'primary':'default'} aria-label="add"
                 onClick={_=>setOpen(true)}
                 className={classes.icons}>
                <Add />
            </IconButton>
        </div>
    )
    const Header = CreateHeader(Title, Controls)
    return(
        <Header {...props}/>
    )
})

const SettingPage = React.memo(({userInfo})=> {
    const classes = useStyles()
    const history = useHistory()
    const {data, addUser, deleteUser} = useUsers()
    const [checked, setChecked] = useRecoilState(userMultiSelect)
    const [open,setOpen] = useState(false)

    const openDialog = useCallback((b) =>{
        setOpen(b)
    },[open])
    const isDev = userInfo.tier === 'dev' || false
    const users = isDev? data :data.filter(_=>_.tier !== 'dev')
    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value)
        const newChecked = [...checked]
        if (currentIndex === -1) {
            newChecked.push(value)
        } else {
            newChecked.splice(currentIndex, 1)
        }
        setChecked(newChecked)
    }

    return (
        <div  className={classes.root}>
            <Header addUser={addUser} deleteUser={deleteUser} setOpen={openDialog}/>
            <div className={classes.main}>
                <List className={classes.root}>
                    {users.map((value,idx) => {
                        const {uid, email, name, tier} = value
                        const labelId = `checkbox-list-label-${name}`
                        return (
                            <ListItem key={idx} role={undefined} dense button
                                      onClick={handleToggle(value)}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked.indexOf(value) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                        className={classes.checkBox}
                                    />
                                </ListItemIcon>
                                <ListItemText className={classes.listText} id={uid} primary={`${name}`} secondary={email}/>
                                <ListItemText  id={uid} primary={`${tier}`} className={classes.tierStyle}/>
                            </ListItem>
                        )
                    })}
                </List>
            </div>
            <SettingDialog open={open}
                           setOpen={openDialog}
                           addUser={addUser}
            />
        </div>
    )
})

export default SettingPage