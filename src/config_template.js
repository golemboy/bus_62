// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: false,
    intentMap: {
        'AMAZON.RepeatIntent': 'RepeatIntent',
        'AMAZON.CancelIntent': 'CancelIntent',
        'AMAZON.HelpIntent': 'HelpIntent',
        'AMAZON.StopIntent': 'StopIntent',
        'AMAZON.NavigateHomeIntent': 'NavigateHomeIntent',
        'AMAZON.YesIntent': 'YesIntent',
        'AMAZON.NoIntent': 'NoIntent',
        'AMAZON.FallbackIntent': 'FallbackIntent',
    },
    user: {
        
        updatedAt: true,
        dataCaching: true,
        implicitSave: true,
        context: {
            enabled: true,
        }
    },
    db: {
        FileDb: {
            pathToFile: '../db/bus_62_db.json',
        },        
        DynamoDb: {
            tableName: 'Bus_62_data',
            /*awsConfig : only for test with ExpressJS remove */
            awsConfig: {
                accessKeyId: 'xxxx',
                secretAccessKey: 'xxxx', 
                region:  'xxxxx',
            },
        },                
    },
 };
 