const fs = require('fs')
const path = require('path')
const log4js = require('log4js')
const DEST_FOLDER = path.join(process.cwd(),"BABE-USR-DATA")
const KEEP_FOLDER = path.join(process.cwd(),"CONFIG")
const DB_PATH = path.join(KEEP_FOLDER,'db.json')
const {writeFilePromise} = require('./utils')

const BASE_CONFIG = {
    server:"http://127.0.0.1:3276/share",
    remove_assets: false,
    td_output_folder: "D:\\Project\\baberose\\04_DEV\\registration-app\\td\\output",
}
/** @return {string} */
//todo check the ffmpeg setting to reduce the size of gif
function CreateFFMPEGBat(config){
    return `cd ${config.td_output_folder} \n`
        + `ffmpeg -i ${path.join(config.td_output_folder, 'out.mp4')} -filter_complex "[0]reverse[r];[0][r]concat,loop=0:61,setpts=N/30/TB" -y ${path.join(config.td_output_folder, 'convert.mp4')} \n`
        + `ffmpeg -t 4 -i ${path.join(config.td_output_folder, 'convert.mp4')} -filter_complex "[0:v] fps=15,scale=w=540:h=-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" -y ${path.join(config.td_output_folder, 'output.gif')} \n`;
}
/** @return {string} */
function CreateList(config){
    return `file \'${path.join(config.td_output_folder, 'convert.mp4')}\'\n`
}
const checkConfig = async () =>{
    let config = undefined;
    try{
        config = require(path.join(KEEP_FOLDER,"config.json"))
    }
    catch (e) {
        console.log('creating config.json')
    }
    const write = async () =>{
        await writeFilePromise(path.join(KEEP_FOLDER, 'config.json'), JSON.stringify(BASE_CONFIG))
        return require(path.join(KEEP_FOLDER,"config.json"))
    }
    return config !== undefined ? config : await write()
}
const writeBatchFile = async (config) =>{
    await writeFilePromise(path.join(config.td_output_folder,'convert.bat'),CreateFFMPEGBat(config))
    await writeFilePromise(path.join(config.td_output_folder,'list.txt'),CreateList(config))
}

async function setupProject() {
    console.log('DESTINATION PATH:',DEST_FOLDER)
    if (!fs.existsSync(DEST_FOLDER)) {
        fs.mkdirSync(DEST_FOLDER)
    }
    if (!fs.existsSync(KEEP_FOLDER)) {
        fs.mkdirSync(KEEP_FOLDER)
    }
    let cfg = await checkConfig()
    await writeBatchFile(cfg)
    log4js.configure({
        appenders: {
            out: { type: 'stdout' },
            app: { type: 'file', filename: 'application.log' }
        },
        categories: { default: { appenders: ['out', 'app'], level: 'all' } }
    })
    const logger = log4js.getLogger('output')
    return {DEST_FOLDER : DEST_FOLDER, DB_PATH: DB_PATH,logger:logger, SERVER_URL: cfg.server, BAT_PATH: cfg.td_output_folder}
}
module.exports = {setupProject}