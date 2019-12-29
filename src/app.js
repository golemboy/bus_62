'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const {App} = require('jovo-framework');
const {Alexa} = require('jovo-platform-alexa');
const {JovoDebugger} = require('jovo-plugin-debugger');
const ratp = require('./ratp_api_calls');
const tools = require('./tools');
const { DynamoDb } = require('jovo-db-dynamodb');

const app = new App();

app.use(
    new Alexa(),
    new JovoDebugger(),
    new DynamoDb()    
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    async LAUNCH() {
        this.ask('Pour quelle station souhaitez-vous connaître les horaires de passage ?','Pouvez vous me donner une station ?');
    },
    async CancelIntent()  {
        await this.toIntent('StopIntent')
    },
    async StopIntent()  {
        this.tell('Merci pour votre recherche et à bientôt.')
    },
   
    async HelpIntent()  {
        this.ask('Pouvez vous m\'indiquer le nom de la station dont vous souhaitez connaitre les horaires de passage de la ligne ?');
    },
    async NavigateHomeIntent()  { 
        await this.toIntent('LAUNCH')
    },
    async YesIntent() {
        await this.toIntent('RepeatIntent')
    },
    async NoIntent() {
        await this.toIntent('LAUNCH');
    },

    async FallbackIntent() {
        await this.toIntent('StopIntent');
    },

    async RepeatIntent()  {
        
        let userData  = this.$user.$data
        
        if ( userData !== undefined  
            && !tools.isEmpty(userData)
            && !userData.HorairesData.error ) {            
                this.$data.HorairesData = userData.HorairesData
                await this.toIntent('HorairesApiIntent')
        }
        else {
            await this.toIntent('LAUNCH')
        }
    },
    
    async HorairesIntent() {
        const station = this.$inputs.station
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
                    await this.toIntent('LAUNCH');
                    break;
                case 'CONFIRMED': //réponse oui 
                    const data = {
                        type: 'bus',
                        code: '62',
                        way: 'A+R',                        
                        schedules : {},
                        station: station,                        
                        error: true
                    };
                    this.$data.HorairesData = data;
                    await this.toIntent('HorairesApiIntent');
                    break;
                default:
                    const la_station = station.key;
                    
                    const speech = 'Vous recherchez les horaires de passage du bus 62 station '+la_station+' ?';
                    const reprompt = "Veuillez répondre par oui ou non s'il vous plait.";

                    this.$alexaSkill.$dialog.confirmIntent(speech,reprompt)
                    break;                    
            }
        

        }

        
    },
     async HorairesApiIntent() {
        let HorairesData = this.$data.HorairesData
        const type = HorairesData.type
        const code = HorairesData.code
        const way = HorairesData.way        
        const station = HorairesData.station.id        
        const la_station = HorairesData.station.key;

        try {
            const output = await ratp.call_schedules(type, code, station, way)
            
            
            // console.log('----------debut async log---')
            // console.log(output)
            // console.log('----------fin async log---')

            const message = 'Station '+la_station+'<break time="1s"/>'+tools.display(tools.flat(output))

            // console.log('----------debut message log---')
            // console.log(message)
            // console.log('----------fin message log---')
            
            
            HorairesData.schedules = output
            HorairesData.error = false
            this.$user.$data.HorairesData = HorairesData
            
            this.tell(message)

        }
        catch(error) {
            console.log('----------debut call_schedules erreur log---')
            console.log(error)
            console.log('----------fin call_schedules erreur log---')



            const data = {
                type: 'bus',
                code: '62',
                way: 'A+R',                
                schedules : {},
                station: station,                        
                error: true
            };
                                    
            this.$user.$data.HorairesData = data
            this.tell(error)
        }
        
        
        

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





// async function getSchedule3(horaires_data, type, code) {
//     let data = horaires_data
//     let la_station = horaires_data.station.key
//     const way = 'A+R'

//     const options = {
//         uri: 'https://api-ratp.pierre-grimaud.fr/v3/schedules/'+type+'/'+code+'/'+horaires_data.station.id+'/'+way+'?_format=json',
//         json: true // Automatically parses the JSON string in the response
//     };
//     console.log('API Request: '+options.uri)
//     const content = await requestPromise(options);
//     const schedules = content.result.schedules
//     //const message = tools.display(tools.flat(schedules))
//     data.schedules = schedules
//     //data.message = message
//     data.error = false    
//     return await data
// }


module.exports.app = app;
