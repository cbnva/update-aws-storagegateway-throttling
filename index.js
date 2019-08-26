// This object containing arrays determines what bandwidth setting should be used
// for any hour of the day. There are many ways to customize this, and you don't
// have to stop with two settings.
var timeTable = {
  //      0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23
  'Sun': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  'Mon': [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
  'Tue': [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
  'Wed': [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
  'Thu': [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
  'Fri': [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
  'Sat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
};

// Set the lambda's GatewayARN variable with the gateway ARN.
var gatewayARN = process.env.GatewayARN;

var timeZone = "America/New_York";
var megabit = 1024 * 1024;
var bandwidthSettings = [
  {
    AverageDownloadRateLimitInBitsPerSec: 50 * megabit,
    AverageUploadRateLimitInBitsPerSec: 9.5 * megabit,
  },
  {
    AverageDownloadRateLimitInBitsPerSec: 40 * megabit,
    AverageUploadRateLimitInBitsPerSec: 1 * megabit,
  }
];






var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

function getBandwidthSetting(date) {
  if(!date){
    date = new Date();
  }
  
  // We need to get the local time including DST. Javascript has terrible date handling functions,
  // so we're using the DateTimeFormat class to get the WeekDay and the hour.
  
  var weekDay = new Intl.DateTimeFormat('en-US', {timeZone: timeZone, weekday:'short'}).format(date);
  var hour =  parseInt(new Intl.DateTimeFormat('en-US', {timeZone: timeZone, hour:'2-digit', hour12: false}).format(date));
  var bandwidthSetting = parseInt(timeTable[weekDay][hour])
  
  console.log({
    weekDay: weekDay,
    hour: hour,
    bandwidthSetting: bandwidthSetting,
  });
  
  return bandwidthSetting;
}

exports.handler = async (event) => {
  var gateway = new AWS.StorageGateway();

  var bandwidthSetting = getBandwidthSetting();

  var params = bandwidthSettings[bandwidthSetting];
  
  
  params.GatewayARN = gatewayARN;

  return gateway.updateBandwidthRateLimit(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    return {
      error: err,
      data : data
    };
  }).promise();
  
};
