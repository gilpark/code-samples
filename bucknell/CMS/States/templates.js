export const fieldState = {
    index:-1,
    interfaceType:"", //(text|textArea|file)
    name:"",
    note:"",
    value:"",
    option:{}
}
export const stateOption = {
    width:"half", //(half, full,half-right)
}
export const fileOption ={
    author:"",
    contentType:"",
    contentSubType:"",
    downloadURL:"",
    fileType:"",
    id:"",
    name:"",
    note:"",
    size:"",
    tags:"",
    title:"",
    updated:"",
    queries:''// this need to be set from serverside
}

//todo refactor adapt the above
const createFieldData = (interfaceType, name, props = {}, option= {}) =>{
    const properties = {
        index: -1,
        note: "",
        value:""
    }
    const optionProperties = {
        width:"half"
    }
    if(interfaceType ==='file')
        return {...properties,...props, interfaceType: interfaceType, name:name,
            option: {...optionProperties, ...option}, data:{}}
    return {...properties,...props, interfaceType: interfaceType, name:name,
        option: {...optionProperties, ...option}}
}
export const templateCategorySetting ={
    title:"Category",
    note:'Category Settings',
    uid:"",
    updated:"",
    fields:[
        createFieldData('file','vo',{note:'vo', index:0},{fileFilter:'audio'}),
        createFieldData('file','caption file',{note:'caption', index:1},{fileFilter:'application'}),
        // createFieldData('file','vr caption file',{note:'caption-vr', index:2},{fileFilter:'application'}),
    ]
}
export const template360 = {
    title:"360video title placeholder",
    note:'360videos',
    uid:"360videos",
    updated:"",
    fields:[
        createFieldData('file','360video1',{note:'360video', index:0}, {fileFilter:'video'}),
        createFieldData('file','360video2',{note:'360video', index:1}, {fileFilter:'video'}),
        createFieldData('file','360video3',{note:'360video', index:2}, {fileFilter:'video'}),
        createFieldData('file','360video4',{note:'360video', index:3}, {fileFilter:'video'}),
        createFieldData('file','360video5',{note:'360video', index:4}, {fileFilter:'video'}),
        createFieldData('file','360video6',{note:'360video', index:5}, {fileFilter:'video'}),
        createFieldData('file','360video7',{note:'360video', index:6}, {fileFilter:'video'}),
        createFieldData('file','360video8',{note:'360video', index:7}, {fileFilter:'video'}),
        createFieldData('file','360video9',{note:'360video', index:8}, {fileFilter:'video'}),
        createFieldData('file','360video10',{note:'360video', index:9}, {fileFilter:'video'}),

    ]
}
export const templateGallery = {
    title:"gallery title placeholder ",
    note:'gallery',
    uid:"gallery",
    updated:"",
    fileFilter:'image',
    fields:[
        createFieldData('file','Image1',{note:'image', index:0},{fileFilter:'image,video'}),
        createFieldData('file','Image2',{note:'image', index:1},{fileFilter:'image,video'}),
        createFieldData('file','Image3',{note:'image', index:2},{fileFilter:'image,video'}),
        createFieldData('file','Image4',{note:'image', index:3},{fileFilter:'image,video'}),
        createFieldData('file','Image5',{note:'image', index:4},{fileFilter:'image,video'}),
        createFieldData('file','Image6',{note:'image', index:5},{fileFilter:'image,video'}),
        createFieldData('file','Image7',{note:'image', index:6},{fileFilter:'image,video'}),
        createFieldData('file','Image8',{note:'image', index:7},{fileFilter:'image,video'}),
        createFieldData('file','Image9',{note:'image', index:8},{fileFilter:'image,video'}),
        createFieldData('file','Image10',{note:'image', index:9},{fileFilter:'image,video'}),
        createFieldData('file','Image11',{note:'image', index:10},{fileFilter:'image,video'}),
        createFieldData('file','Image12',{note:'image', index:11},{fileFilter:'image,video'}),
        createFieldData('file','Image13',{note:'image', index:12},{fileFilter:'image,video'}),
        createFieldData('file','Image14',{note:'image', index:13},{fileFilter:'image,video'}),
        createFieldData('file','Image15',{note:'image', index:14},{fileFilter:'image,video'}),
        createFieldData('file','Image16',{note:'image', index:15},{fileFilter:'image,video'}),
        createFieldData('file','Image17',{note:'image', index:16},{fileFilter:'image,video'}),
        createFieldData('file','Image18',{note:'image', index:17},{fileFilter:'image,video'}),
        createFieldData('file','Image19',{note:'image', index:18},{fileFilter:'image,video'}),
        createFieldData('file','Image20',{note:'image', index:20},{fileFilter:'image,video'}),
    ]
}
export const templateInfo = {
    title:"info title placeholder",
    note:'info',
    uid:"info",
    updated:"",
    fields:[
        // createFieldData('textArea','textArea',{index:0}),
        createFieldData('text','test text 1',{index:0},{width:'full'}),
        createFieldData('text','test text 2',{index:1},{width:'full'}),
        createFieldData('text','test text 3',{index:2},{width:'full'}),
    ]
}

