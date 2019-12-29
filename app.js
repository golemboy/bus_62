'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------
/*
const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
*/
const {App} = require('jovo-framework');
const {Alexa} = require('jovo-platform-alexa');
const {JovoDebugger} = require('jovo-plugin-debugger');
const ratp = require('./ratp_api_calls');
const tools = require('./tools');
//const { DynamoDb } = require('jovo-db-dynamodb');
const { FileDb } = require('jovo-db-filedb');
const requestPromise = require('request-promise-native');


const app = new App();

app.use(
    new Alexa(),
    new JovoDebugger(),
    //new DynamoDb()
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    LAUNCH() {
        this.ask('Pour quelle station souhaitez-vous connaître les horaires de passage ?','Pouvez vous me donner une station ?');
    },
    CancelIntent()  {
        return this.toIntent('StopIntent')
    },
    StopIntent()  {
        this.tell('Merci pour votre recherche et à bientôt.')
    },
   
    HelpIntent()  {
        this.ask('Pouvez vous m\'indiquer le nom de la station dont vous souhaitez connaitre les horaires de passage de la ligne ?');
    },
    NavigateHomeIntent()  { 
        return this.toIntent('LAUNCH')
    },
    YesIntent() {
        return this.toIntent('RepeatIntent')
    },
    NoIntent() {
        return this.toIntent('LAUNCH');
    },
    RepeatIntent()  {
        
        let userData  = this.$user.$data
        
        if ( userData !== undefined  
            && !tools.isEmpty(userData)
            && !userData.HorairesData.error ) {            
                this.$data.HorairesData = userData.HorairesData
                return this.toIntent('HorairesApiIntent')
        }
        else {
            return this.toIntent('LAUNCH')
        }
    },
    
    HorairesIntent() {
        let station = this.$inputs.station
        // console.log('----------debut log---')
        // console.log(station.alexaSkill.resolutions.resolutionsPerAuthority)                
        // console.log(station.value)
        // console.log(station.key)
        // console.log(station.id)        
        // console.log('---------fin log---')

        if (!this.$alexaSkill.$dialog.isCompleted()) {
            this.$alexaSkill.$dialog.delegate()
        }
        else {
            switch (this.$alexaSkill.$dialog.getIntentConfirmationStatus()) { 
                case 'DENIED': //réponse non
                    return this.toIntent('LAUNCH');
                    break;
                case 'CONFIRMED': //réponse oui 
                    let HorairesData = {
                        type: 'bus',
                        code: '62',
                        message: 'aucun message',
                        station: station,                        
                        error: true
                    };
                    this.$data.HorairesData = HorairesData;
                    return this.toIntent('HorairesApiIntent');                    
                default:
                    let la_station = station.key;
                    
                    let speech = 'Vous recherchez les horaires de passage du bus 62 station '+la_station+' ?';
                    let reprompt = "Veuillez répondre par oui ou non s'il vous plait.";

                    this.$alexaSkill.$dialog.confirmIntent(speech,reprompt)
                    break;                    
            }
        

        }

        
    },
     async HorairesApiIntent() {
        
        const type = 'bus'
        const code = '62'
        const way = 'A+R'
                
        try {
            const data = await getSchedule(this.$data.HorairesData, type, code,way)
            console.log('----------debut HorairesApiIntent log---')
            console.log(data)
            console.log('----------fin HorairesApiIntent log---')
            this.$user.$data.HorairesData = data
            this.tell(data.message)
        }
        catch(error) {
            this.$user.$data.HorairesData = error
            this.tell(error.message)
        }
        
        // const data = await Promise.all(
        //     getSchedule2(this.$data.HorairesData, type, code)      
        // )
        // console.log('----------debut HorairesApiIntent log---')
        // console.log(data)
        // console.log('----------fin HorairesApiIntent log---')
        // this.$user.$data.HorairesData = data
        // this.tell(data.message)

        

        
        
            
                   
        //this.$data.HorairesData = data
      
        //return this.toIntent('DisplayHorairesIntent');

        //const message = await getMessage(data)
        
        
        //
        //this.tell(message)

        /*
        try {
            const output = await ratp.call_schedules(type, code, station, 'A+R')
            
            console.log('----------debut async log---')
            console.log(output)
            console.log('----------fin async log---')

            const message = tools.display(tools.flat(output))

            console.log('----------debut async log---')
            console.log(message)
            console.log('----------fin async log---')
            
            
            HorairesData.message = message
            HorairesData.error = false
            this.$user.$data.HorairesData = HorairesData
            
            this.tell(message)

        }
        catch(error) {
            const message = tools.display(error)
            
            HorairesData.message = message
            HorairesData.error = true
            this.$user.$data.HorairesData = HorairesData
            this.tell("une erreur")
            
           this.tell(message)        
        }
        */
        
        
        /*
        ratp.call_schedules(type, code, station, 'A+R').then((output) => {
            let message = tools.display(tools.flat(output))
            HorairesData.message = message
            HorairesData.error = false
            this.$user.$data.HorairesData = HorairesData

            console.log('----------debut async log---')
            console.log(message)
            console.log(HorairesData)
            console.log('----------fin async log---')
                        
        }).catch((error) => {
            let message = tools.display(error)
            HorairesData.message = message
            HorairesData.error = true
            this.$user.$data.HorairesData = HorairesData

        })
        console.log('----------debut log---')
        console.log(this.$user.$data.HorairesData)
        console.log('---------fin log---')
        this.tell("un message")
        */

        /*
        Promise.all([
            ratp.call_schedules(type, code, station, 'A'),
            ratp.call_schedules(type, code, station, 'R')
        ].map(p => p.catch(() => [{"message":"no_data","destination":"no_data"}]))).then ((output) => {
            //console.log(JSON.stringify(tools.flat(output)))
            console.log(output)
            this.tell("Arret : "+la_station+".")
            //this.tell(tools.display(tools.flat(output)))
            
            HorairesData.error = false
            this.$user.$data.HorairesData = HorairesData
            
        }     
        ).catch((error) => {
            this.tell(tools.display(error))

            HorairesData.error = true
            this.$user.$data.HorairesData = HorairesData

        })
        */
        
    }
});

async function getMessage(horaires_data, type, code) {
    try {
        const data = await getSchedule2(horaires_data, type, code)
        console.log('----------debut HorairesApiIntent log---')
        console.log(data)
        console.log('----------fin HorairesApiIntent log---')
        //this.$user.$data.HorairesData = data
        return await data.message
    }
    catch(error) {
        //this.$user.$data.HorairesData = error
        return await error.message
    }
}

async function getSchedule3(horaires_data, type, code) {
    let data = horaires_data
    let la_station = horaires_data.station.key
    const way = 'A+R'

    const options = {
        uri: 'https://api-ratp.pierre-grimaud.fr/v3/schedules/'+type+'/'+code+'/'+horaires_data.station.id+'/'+way+'?_format=json',
        json: true // Automatically parses the JSON string in the response
    };
    console.log('API Request: '+options.uri)
    const content = await requestPromise(options);
    const schedules = content.result.schedules
    const message = tools.display(tools.flat(schedules))
    data.message = message
    data.error = false    
    return await data
}

async function getSchedule2(horaires_data, type, code) {
    //let station = HorairesData.station.id
    let data = horaires_data
    let la_station = horaires_data.station.key
    return new Promise((resolve, reject) => {
        ratp.call_schedules(type, code, horaires_data.station.id, 'A+R').then( (output) => {
            const message = tools.display(tools.flat(output))
            data.message = message
            data.error = false
            resolve(data)
        }).catch((error) => {
            const message = tools.display(error)
            data.message = message
            data.error = true
            reject(data)
        })
    })
}

async function getSchedule(horaires_data, type, code,way) {
    //let station = HorairesData.station.id
    let data = horaires_data
    let la_station = horaires_data.station.key
   
    try {
        const output = await ratp.call_schedules(type, code, horaires_data.station.id, way)
        /*
        console.log('----------debut getSchedule log---')
        console.log(output)
        console.log('----------fin getSchedule log---')
        */

        const message = tools.display(tools.flat(output))
        /*
        console.log('----------debut getSchedule log---')
        console.log(message)
        console.log('----------fin getSchedule log---')
        */

       data.message = message
       data.error = false
       
        /*
        console.log('----------debut getSchedule log---')
        console.log(HorairesData)
        console.log('----------fin getSchedule log---')
        */
       //return data
       //return Promise.resolve(data);
        
    }
    catch(error) {
        const message = tools.display(error)
        
        data.message = message
        data.error = true
        //Promise.reject(new Error(data));
    }    
    return data
    

}

module.exports.app = app;
