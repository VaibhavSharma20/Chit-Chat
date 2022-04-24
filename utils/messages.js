const moment = require('moment');
var today = new Date();
var time = today.getHours() + ":" + today.getMinutes();

function formatMessage(user,text){
    return {
        user,
        text,
        time:time//moment().format('h:mm a')
    }
};

module.exports = formatMessage;