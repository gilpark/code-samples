const request = require('request')
const fs = require('fs')
const path = require('path')
const {getDateTime} = require("./utils");

const makeQProcess = (logger, SERVER_URL) => {
    return function upload(input, cb) {
        console.log("sending....",input)
        console.log("server....",SERVER_URL)
        let formData = {
            first:input.first, last:input.last, email:input.email,folder: "babe", option:input.option,
            file_upload: {
                value: fs.createReadStream(input.file_path),
                options: {
                    filename: input.file_name,
                    contentType: 'image/gif'
                }
            },
        }
        let options = {
            url: SERVER_URL,
            formData: formData
        }
        request.post(options, function optionalCallback(err, httpResponse, body) {
            logger.debug(`option ${options.url}`.white.bold)
            logger.debug(`--------------------------server response-------------------------------`.white.bold)
            logger.debug(`body : ${body} , res : ${httpResponse}`.green)
            if (err) {
                //error
                cb(null,input)
                options.formData.file_upload.value.close()
            } else {
                try {
                    let json = JSON.parse(body)
                    if (json === undefined || json['success'] !== true) {
                        //error
                        cb(null,input)
                        options.formData.file_upload.value.close()
                    } else {
                        logger.debug(`------------------------------------------------------------------------`.white.bold)
                        logger.debug(`[${getDateTime()}]file uploaded : ${input.file_name}`.blue.bold)
                        cb(null, input)
                        options.formData.file_upload.value.close()
                    }
                } catch (e) {
                    console.log("error!!!", e)
                    cb(null,input)
                }
            }
        })
    }
}


const makeGAProcess = (logger, SERVER_URL) => {
    return function upload(input) {
        console.log("sending to GA....",input)
        console.log("ga end point....",SERVER_URL.replace("share","ga"))
        let formData = {
            userID:"BABE", eventType:'event',category:'user-selection',action:`select-action-${input.option}`, label:`user-option-${input.option}`,
        }
        let options = {
            url: SERVER_URL.replace("share","ga"),
            formData: formData
        }
        request.post(options, function optionalCallback(err, httpResponse, body) {
            logger.debug(`option ${options.url}`.white.bold)
            logger.debug(`--------------------------server response-------------------------------`.white.bold)
            logger.debug(`body : ${body} , res : ${httpResponse}`.green)
            if (err) {
                //error
                logger.debug(err)
            } else {
                try {
                    let json = JSON.parse(body)
                    if (json === undefined || json['success'] !== true) {
                    } else {
                        logger.debug(`------------------------------------------------------------------------`.white.bold)
                        logger.debug(`[${getDateTime()}]ga sent : ${input}`.blue.bold)
                    }
                } catch (e) {
                    logger.debug("error!!!", e)
                }
            }
        })
    }
}

module.exports = {makeQProcess: makeQProcess, makeGAProcess:makeGAProcess}