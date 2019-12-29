'use strict';
const https = require('https');

var  api_calls = async (options) => {
    return new Promise((resolve, reject) => {
      // Make the HTTP get request to get the API
      https.get(options, (res) => {
        let body = ''; // var to store the response chunks
        res.on('data', (d) => { body += d; }); // store each response
        res.on('end', () => {
          let result = JSON.parse(body).result
          
          // console.log("---log api_calls debut---")
          // console.log(result)
          // console.log("---log api_calls fin---")
          
          if(result === undefined) {
            reject(JSON.parse(body))
          }
          //regarde si la réponse de l'API contient directement message dans son result => c'est une erreur qui est envoyé par l'API 
          if (result.message !== undefined) {
            reject(JSON.parse(body))
          }
          else {
            resolve(JSON.parse(body))
          }
        });
        res.on('error', (error) => {
          reject(error);
        });
      });
    });
  }
  
module.exports.api_calls = api_calls