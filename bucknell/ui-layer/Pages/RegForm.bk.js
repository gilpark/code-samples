import {
    CreateAcadamicInterestOptions, CreateCitizenShipOptions,
    CreateCountryOptions,
    CreateDayOptions, CreateExpectedEntryOptions, CreateGraduationYearsOptions,
    CreateMonthOptions, CreateStatesOptions,
    CreateYearsOptions,
    baseApplicantForm as a
} from "../Components/RegistrationOptions"
import React, {useEffect, useRef, useState} from "react"
import { useForm, useFieldArray} from "react-hook-form"
import {ErrorMessage} from "@hookform/error-message"
import createStyles from "@material-ui/styles/createStyles"
import makeStyles from "@material-ui/core/styles/makeStyles"
import {ConvertToCSV, downloadCSV, formatRegData, uploadData, validateEmail} from "./api"
import bgSrc from '../assets/reg_bg.png'
import useWindowResize from "../Hooks/useWindowResize"
// import { useScrollPosition } from 'react-use-scroll-position'
// import ReactJson from "react-json-view"

import { useHistory } from "react-router-dom"
const useStyles = makeStyles((theme) => createStyles({
    root: {

        backgroundSize: 'cover',
        display: 'flex',
        flexDirection:'column',
        width: '100%',
        height:'100%',
        minWidth:'500px'
    },
    itemWrapper:{
        display: 'flex',
        flexDirection:p=>p.isMobile?'column':'row',
        flexWrap:'wrap'
    },
    item:{
        margin:'1rem',
        maxWidth:'70%',
        '& > div':{
            marginTop:'0.3rem'
        },
        '& label':{
            color: 'white',
            font: 'Roboto',
            // fontSize:'0.9rem',
            letterSpacing: '0.06rem',
            marginBottom:'1rem'
        },
        '& input[type=text]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(255,255,255,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& input[type=tel]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(255,255,255,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white',

        },
        '& input[type=email]':{
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(255,255,255,0.3)',
            minWidth:'13rem',
            padding:'0.3rem',
            color:'white'
        },
        '& select':{
            color:'white',
            border : 'none',
            outline:'none',
            height: '2rem',
            background: 'rgba(255,255,255,0.3)',
            padding:'0.3rem',
            minWidth:p=>p.isMobile?'5rem':'9rem',
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
        '& input[type=submit]':{
            width:'100%',
            background:'rgba(0,56,101,1)',
            height:'2rem',
            border:'none',
            borderRadius:'0.2rem',
            color:'white',
            margin:'0'
        }
    },

    //select option scroll
    //https://codepen.io/devstreak/pen/dMYgeO
    //https://stackoverflow.com/questions/6662650/change-background-color-of-a-radio-button
    radio:{
        // width:'70%',
        '&> label> input':{
            cursor: 'pointer',
            verticalAlign:'middle',
            marginBottom:'0.4rem',
            marginRight:'0.5rem',
            width:'1rem',
        },
    },
    radioWrapper:{
        display: 'flex',
        flexWrap:'wrap',
        '& > div':{
            marginRight: '2rem'
        }
    },

    birthDayWrapper:{
        display: 'flex',

        '& > select':{
            marginRight: '0.5rem',

        }
    },
    addressWrapper:{
        display: 'flex',
        flexWrap:'wrap',
        '& > div':{
            marginRight: '2rem'
        }
    },
    addressItem:{
        marginTop:'0.3rem',
        '& > div':{
            marginTop:'0.3rem'
        },
    },
    addressLine:{
        '& > input':{
            width:p=>p.isMobile?'21rem':'28rem',
            // minWidth:p=>p.isMobile?'5rem':'9rem',
        },

    }
}))

export default function RegForm({setUser}){
    const { register, handleSubmit, watch, errors,control } = useForm()
    const {email,isAddressSame, phonePermission, homePhone, mobilePhone, studentType} = watch()
    const size = useWindowResize()
    const isMobileCondition = window.innerWidth < 450
    const [isMobile, setIsMobile] = useState(isMobileCondition)
    const [submitted, setSubmitted] = useState(false)
    const history = useHistory()
    useEffect(()=>{
        setIsMobile(isMobileCondition)
    },[size])

    const isStudent = studentType? studentType.includes('student') : true
    const classes = useStyles({isMobile:isMobile})
    const onSubmit = data => {
    //disable submit button
        setSubmitted(true)
        const parsed = formatRegData(data)
        uploadData(parsed).then(r=>r.json())
            .then(r =>{
                setSubmitted(false)
                console.log('submit result:', r)
                const {data,error} = r
                if(error) {
                    window.alert(error)
                    return
                }
                setUser(data.pin)
                history.push('/virtualExperience')
            })
            .catch(e =>{
                window.alert(e)
                setSubmitted(false)
            })
    }

    const validateEmailMatch = value => email === value
    const isMailingAddressRequired = isAddressSame !== undefined && isAddressSame === 'no'
    const isPhoneRequired = phonePermission !== undefined && phonePermission === true && homePhone === "" && mobilePhone ===""

    const tempOnPlay = () =>{
    }
    useEffect(()=>{
    },[errors,isAddressSame])
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={classes.root}>
            {/*<input type={'submit'} className={classes.item}/>*/}
            {/*<button className={classes.item} onClick={tempOnPlay}>Play</button>*/}

            {/*student type required*/}
            <div className={classes.itemWrapper}>
                <div className={classes.item} >
                    <label >Guest Type*</label>
                    <div >
                        <select name={a.guestType.key}
                                ref={register({ required: a.guestType.required })}
                        >
                            <option value="">Select type</option>
                            <option value="First year student">First year student</option>
                            <option value="Transfer student">Transfer student</option>
                            <option value="Guidance counselor">Guidance counselor</option>
                            <option value="Parent">Parent</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.guestType.key} as={'p'}
                                  message={"* This is required"}/>
                </div>
            </div>


            {/*student's email required*/}
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Email Address*</label>
                    <div >
                        <input type={'email'}
                               name={a.email.key}
                               ref={register({ required: a.email.required, validate:validateEmail})}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.email.key} as={'p'}
                                  message={errors.email?.type==='required'?`* This is require`:
                                      'this email address not acceptable'}/>
                </div>
                <div className={classes.item} >
                    <label >Confirm Email Address*</label>
                    <div >
                        <input type="email"
                               name={a.email2.key}
                               ref={register({ required: a.email2.required, validate:validateEmailMatch })}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.email2.key} as={'p'}
                                  message={"*Email doesn't match"}/>
                </div>
            </div>

            {/*student first, last name required*/}

            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label>First Name*</label>
                    <div >
                        <input
                            type={'text'}
                            name={a.firstName.key}
                            ref={register({ required: a.firstName.required })}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.firstName.key} as={'p'}
                                  message={"* This is required"}/>
                </div>
                {/*middle name*/}
                <div className={classes.item} >
                    <label >Middle Name</label>
                    <div >
                        <input type="text"
                               name={a.middleNAme.key}
                               ref={register({ required: a.middleNAme.required })}
                        />
                    </div>
                </div>
                {/*last name required*/}
                <div className={classes.item} >
                    <label >Last Name*</label>
                    <div >
                        <input type="text"
                               name={a.lastName.key}
                               ref={register({ required: a.lastName.required })}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.lastName.key} as={'p'}
                                  message={"* This is required"}/>
                </div>
            </div>


            {isStudent && //preferred first name*
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label>Preferred First Name</label>
                    <div>
                        <input
                            type="text"
                            name={a.preferredName.key}
                            ref={register({required: a.preferredName.required && isStudent})}
                        />
                    </div>
                </div>
            </div>
            }

            {isStudent&& //birth day*
            <div className={classes.itemWrapper}
                 // ref={el=> birthdaRef.current = el}
            >
                {/*Birth day required */}
                <div className={classes.item}>
                    {/*useFieldArray*/}
                    <label >Birthdate*</label>
                    <div className={classes.birthDayWrapper}>
                        <select aria-label="Month"
                                name={`${a.birthday.key}.month`}
                                ref={register({ required: a.birthday.required && isStudent})}
                        >
                            <CreateMonthOptions/>
                        </select>
                        <select aria-label="Day"
                                name={`${a.birthday.key}.day`}
                                ref={register({ required: a.birthday.required && isStudent})}
                        >
                            <CreateDayOptions/>
                        </select>
                        <select aria-label="Year"
                                name={`${a.birthday.key}.year`}
                                ref={register({ required: a.birthday.required && isStudent})}
                        >
                            <CreateYearsOptions/>
                        </select>
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.birthday.key} as={'p'}
                                  message={"* This is required"}/>
                </div>
            </div>
            }
            { isStudent && //sex
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Sex</label>
                    <div className={classes.radioWrapper} >
                        <div className={classes.radio}>
                            <label>
                                <input type={'radio'}
                                       value={'female'}
                                       name={a.gender.key}
                                       ref={register({ required: a.gender.required })}/>
                                Female
                            </label>
                        </div>
                        <div className={classes.radio}>
                            <label>
                                <input type={'radio'}
                                       value={'male'}
                                       name={a.gender.key}
                                       ref={register({ required: a.gender.required })}/>
                                Male
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            }
            {isStudent &&//permernent Address required
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Permanent Address*</label>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.permanentAddress.key} as={'p'}
                                  message={"* This is required"}/>
                    <div className={classes.addressItem}>
                        <label >Address Line 1</label>
                        <div className={classes.addressLine}>
                            <input
                                type={'text'}
                                name={`${a.permanentAddress.key}.address1`}
                                ref={register({ required: a.permanentAddress.required && isStudent})}
                            />
                        </div>
                    </div>
                    <div className={classes.addressItem}>
                        <label >Address Line 2</label>
                        <div className={classes.addressLine}>
                            <input
                                type={'text'}
                                name={`${a.permanentAddress.key}.address2`}
                                ref={register({ required: false })}
                            />
                        </div>
                    </div>
                    <div className={classes.addressWrapper}>
                        <div className={classes.addressItem}>
                            <label >City</label>
                            <div>
                                <input
                                    type={'text'}
                                    name={`${a.permanentAddress.key}.city`}
                                    ref={register({ required: a.permanentAddress.required && isStudent})}
                                />
                            </div>
                        </div>
                        <div className={classes.addressItem} >
                            <label >State/Province/Region</label>
                            <div >
                                <input
                                    type={'text'}
                                    name={`${a.permanentAddress.key}.region`}
                                    ref={register({ required: a.permanentAddress.required && isStudent})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={classes.addressWrapper}>
                        <div className={classes.addressItem}>
                            <label >Postal Code</label>
                            <div>
                                {/*todo validate postal code*/}
                                <input
                                    type={'text'}
                                    name={`${a.permanentAddress.key}.postalCode`}
                                    ref={register({ required: a.permanentAddress.required && isStudent})}
                                />
                            </div>
                        </div>

                    </div >
                    <div className={classes.addressItem}>
                        <label >Country</label>
                        <div >
                            <select
                                name={`${a.permanentAddress.key}.country`}
                                ref={register({ required: a.permanentAddress.required && isStudent})}
                            >
                                <CreateCountryOptions/>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            }

            {isStudent && /*checking another address required*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >
                        Is your Mailing Address the same as your Permanent Address?*
                    </label>
                    <div className = {classes.radioWrapper}>
                        <div className={classes.radio}>
                            <label >
                                <input type={'radio'}
                                       name={a.isAddressSame.key} value={'yes'}
                                       ref={register({ required: a.isAddressSame.required && isStudent})}/>
                                Yes
                            </label>
                        </div>
                        <div className={classes.radio}>
                            <label >
                                <input type={'radio'}
                                       name={a.isAddressSame.key} value={'no'}
                                       ref={register({ required: a.isAddressSame.required && isStudent})}/>
                                No
                            </label>
                        </div>
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.isAddressSame.key} as={'p'}
                                  message={"* This is required"}/>
                </div>
            </div>
            }

            {/*mailing address */}
            {
               isStudent && isMailingAddressRequired &&
                <div className={classes.itemWrapper}>
                    <div className={classes.item}>
                        <label >Mailing Address*</label>
                        <ErrorMessage errors ={errors}
                                      className={'error'}
                                      name={a.mailingAddress.key} as={'p'}
                                      message={"* This is required"}/>
                        <div className={classes.addressItem}>
                        <label >Address Line 1</label>
                        <div className={classes.addressLine}>
                            <input
                                type={'text'}
                                name={`${a.mailingAddress.key}.address1`}
                                ref={register({ required: isMailingAddressRequired})}
                            />
                        </div>
                    </div>
                    <div className={classes.addressItem}>
                        <label >Address Line 2</label>
                        <div className={classes.addressLine}>
                            <input
                                type={'text'}
                                name={`${a.mailingAddress.key}.address2`}
                                ref={register({ required: false})}
                            />
                        </div>
                    </div>
                        <div className={classes.addressWrapper}>
                            <div className={classes.addressItem}>
                                <label >City</label>
                                <div>
                                    <input
                                        type={'text'}
                                        name={`${a.mailingAddress.key}.city`}
                                        ref={register({ required: isMailingAddressRequired})}
                                    />
                                </div>
                            </div>
                            <div className={classes.addressItem} >
                                <label >State/Province/Region</label>
                                <div >
                                    <input
                                        type={'text'}
                                        name={`${a.mailingAddress.key}.region`}
                                        ref={register({ required:isMailingAddressRequired})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={classes.addressWrapper}>
                            <div className={classes.addressItem}>
                                <label >Postal Code</label>
                                <div>
                                    {/*todo validate postal code*/}
                                    <input
                                        type={'text'}
                                        name={`${a.mailingAddress.key}.postalCode`}
                                        ref={register({ required: isMailingAddressRequired})}
                                    />
                                </div>
                            </div>

                        </div >
                        <div className={classes.addressItem}>
                            <label >Country</label>
                            <div >
                                <select
                                    name={`${a.mailingAddress.key}.country`}
                                    ref={register({ required: isMailingAddressRequired})}
                                >
                                    <CreateCountryOptions/>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>
            }

            { isStudent && /*student home phone*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Student Home Phone</label>
                    <div >
                        <input
                            type={'tel'}
                            name={a.homePhone.key}
                            ref={register({ required: isPhoneRequired })}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.homePhone.key} as={'p'}
                                  message={"* either home/mobile phone number required"}/>
                </div>

                {/*student mobile phone*/}
                <div className={classes.item}>
                    <label >Student Mobile Phone</label>
                    <div>
                        <input
                            type={'tel'}
                            name={a.mobilePhone.key}
                            ref={register({ required: isPhoneRequired })}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.mobilePhone.key} as={'p'}
                                  message={"* either home/mobile phone number required"}/>
                </div>
            </div>
            }

            { isStudent&& /* phone permission*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <div >
                        <div className={classes.radio}>

                            <label>
                                <input type={'checkbox'}
                                       name={a.phonePermission.key}
                                       ref={register({ required: a.phonePermission.required })}
                                />
                                I give permission to be contacted by Bucknell via mobile phone, which may include phone calls or text messaging.
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            }

            {isStudent && /*parent email*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Parent Email Address</label>
                    <div>
                        <input
                            type={'email'}
                            name={a.parentEmail.key}
                            ref={register({ required: a.parentEmail.required, validate: d => d ===""?true : validateEmail(d) })}
                        />
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.mailingAddress.key} as={'p'}
                                  message={"this email address not acceptable"}/>
                </div>
            </div>
            }

            { isStudent && /*HS graduation year*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >High School Graduation Year</label>
                    <div >
                        <select
                            name={a.highschoolGradYear.key}
                            ref={register({ required: a.highschoolGradYear.required})}
                        >
                            <CreateGraduationYearsOptions/>
                        </select>
                    </div>
                </div>
            </div>
            }
            {isStudent && /*high scool name & code*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >High School</label>
                    <div >
                        <input
                            type={'text'}
                            name={a.highschool.key}
                            ref={register({ required: a.highschool.required})}
                        />
                    </div>
                </div>
                <div className={classes.item}>
                    <label >High School CEEB Code</label>
                    <div >
                        <input
                            type={'text'}
                            name={a.highschoolCeebCode.key}
                            ref={register({ required: a.highschoolCeebCode.required})}
                        />
                    </div>
                </div>
            </div>
            }

            { isStudent && /*Expected Entry Term*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Expected Entry Term*</label>
                    <div >
                        <select
                            name={a.expectedEntryTerm.key}
                            ref={register({ required: a.expectedEntryTerm.required && isStudent})}
                        >
                            <CreateExpectedEntryOptions/>
                        </select>
                    </div>
                    <ErrorMessage errors ={errors}
                                  className={'error'}
                                  name={a.expectedEntryTerm.key} as={'p'}
                                  message={"* This is required"}/>
                </div>
            </div>
            }

            {isStudent && /*primary interest*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label>Primary Academic Interest</label>
                    <div >
                        <select
                            name={a.academicInterest.key}
                            ref={register({ required: a.academicInterest.required})}
                        >
                            <CreateAcadamicInterestOptions/>
                        </select>
                    </div>
                </div>
                {/*secondary interest*/}
                <div className={classes.item}>
                    <label>Secondary Academic Interest</label>
                    <div >
                        <select
                            name={a.secondaryInterest.key}
                            ref={register({ required: a.secondaryInterest.required})}
                        >
                            <CreateAcadamicInterestOptions/>
                        </select>
                    </div>
                </div>
            </div>
            }

            {isStudent && /*hispanic*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Are you Hispanic or Latino?</label>
                    <div className={classes.radioWrapper}>
                        <div className={classes.radio}>
                            <label >
                                <input type={'radio'} value={'yes'}
                                       name={a.hispanicEthnicity.key}
                                       ref={register({ required: a.hispanicEthnicity.required})}
                                />
                                Yes
                            </label>
                        </div>
                        <div className={classes.radio}>
                            <label >
                                <input type={'radio'} value={'no'}
                                       name={a.hispanicEthnicity.key}
                                       ref={register({ required: a.hispanicEthnicity.required})}
                                />
                                No
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            }
            { isStudent && /*race*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Race (Check all that apply)</label>
                    <div >
                        <div className={classes.radio}>
                            <label >
                                <input type={'checkbox'}
                                       name={`${a.race.key}.IndianOrNative`}
                                       ref={register({ required: a.race.required})}
                                />
                                American Indian or Alaska Native</label>
                        </div>
                        <div className={classes.radio}>
                            <label >
                                <input type={'checkbox'}
                                       name={`${a.race.key}.asian`}
                                       ref={register({ required: a.race.required})}
                                />
                                Asian</label>
                        </div>
                        <div className={classes.radio}>
                            <label >
                                <input type={'checkbox'}
                                       name={`${a.race.key}.black`}
                                       ref={register({ required: a.race.required})}
                                />
                                Black or African American</label>
                        </div>
                        <div className={classes.radio}>
                            <label >
                                <input type={'checkbox'}
                                       name={`${a.race.key}.hawaiianOrIslander`}
                                       ref={register({ required: a.race.required})}
                                />
                                Native Hawaiian or Other Pacific Islander</label>
                        </div>
                        <div className={classes.radio}>
                            <label>
                                <input type={'checkbox'}
                                       name={`${a.race.key}.white`}
                                       ref={register({ required: a.race.required})}
                                />
                                White
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            }

            {isStudent && /*primary citizenshipt*/
            <div className={classes.itemWrapper}>
                <div className={classes.item}>
                    <label >Primary Citizenship</label>
                    <div >
                        <select
                            name={a.primaryCitizenship.key}
                            ref={register({ required: a.primaryCitizenship.required})}
                        >
                            <CreateCitizenShipOptions/>
                        </select>
                    </div>
                </div>

                {/*dual citizenshipt*/}
                <div className={classes.item}>
                    <label>Dual Citizenship</label>
                    <div >
                        <select
                            name={a.dualCitizenship.key}
                            ref={register({ required: a.dualCitizenship.required})}
                        >
                            <CreateCitizenShipOptions/>
                        </select>
                    </div>
                </div>

                {/*other citizenshipt*/}
                <div className={classes.item}>
                    <label>Other Citizenship</label>
                    <div >
                        <select
                            name={a.otherCitizenship.key}
                            ref={register({ required: a.otherCitizenship.required})}
                        >
                            <CreateCitizenShipOptions/>
                        </select>
                    </div>
                </div>
            </div>
            }
            <div className={classes.item}>
                <input type={'submit'} className={classes.item} disabled={submitted}/>
            </div>
            {/*{regData && <ReactJson src={regData} />}*/}
        </form>

    )
}