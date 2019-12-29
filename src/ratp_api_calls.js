'use strict';
const request_api = require('./request_api_call');

const host = 'api-ratp.pierre-grimaud.fr';
const port = 443;

var rejectedPromise = async (error) =>  Promise.reject(new Error(error))
var resolvedPromise = async (msg) => Promise.resolve(msg)

var call_schedules = async (type, code, station, way) => {
    const path = '/v3/schedules/'+type+'/'+code+'/'+station+'/'+way+'?_format=json';
    const log_api_request = 'API Request: ' + host + path
    console.log(log_api_request);
    try {
        let content = await request_api.api_calls({host: host, path: path, port: port})
        
        // console.log("---debut log call_schedules---")
        // console.log(content.result.schedules)
        // console.log("---fin log call_schedules---")
        
        return resolvedPromise(content.result.schedules)
    }
    catch( error ) {    
        const message = ' Code '+error.result.code+' : '+error.result.message+'\n'+log_api_request
        // console.log("---debut erreur log call_schedules---")
        // console.log(message)
        // console.log("---fin erreur log call_schedules---")
        return rejectedPromise(message)
    }
    
  }



  module.exports.call_schedules = call_schedules