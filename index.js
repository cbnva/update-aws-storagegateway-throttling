// `timeTable` determines the bandwidth setting for any hour of the day.
// There are many ways to customize this, and you don't have to stop with two settings.
// You can also create other daily schedules.

// Daily Schedule
//      hour:  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23
var weekend = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
var workday = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ];

var timeTable = {
  'Sun': weekend,
  
  'Mon': workday,
  'Tue': workday,
  'Wed': workday,
  'Thu': workday,
  'Fri': workday,
  
  'Sat': weekend,
  
  // Holidays
  '2019-09-02': weekend, // Labor Day
  '2019-11-28': weekend, // Thanksgiving
  '2019-12-25': weekend, // Christmas
  '2020-01-01': weekend, // New Year's Day
  '2020-05-25': weekend, // Memorial Day
  '2020-07-03': weekend, // Independence Day (observed)
  '2020-09-07': weekend, // Labor Day
  '2020-11-26': weekend, // Thanksgiving
  '2020-12-25': weekend, // Christmas
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
    AverageUploadRateLimitInBitsPerSec: 3 * megabit,
  }
];






var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

function getDateParts(date, timeZone) {
  var parts = {};
  new Intl.DateTimeFormat('en-US', {timeZone: timeZone,
                                    year:     'numeric', 
                                    month:    '2-digit', 
                                    day:      '2-digit', 
                                    hour:     '2-digit', 
                                    weekday:  'short', 
                                    hour12:   false
    
      }).formatToParts(date)
        .forEach(function (element) {
    if (typeof element.type === 'string' && element.type !== 'literal') {
      parts[element.type] = element.value
    }
  });
  return parts;
}

function getBandwidthSetting(date) {
  if(!date){
    date = new Date();
  }
  
  // We need to get the local time including DST. Javascript has terrible date handling functions,
  // so we're using the DateTimeFormat class to get the WeekDay and the hour.
  
  var dateParts = getDateParts(date, timeZone);
  
  // Check if today's date is defined in `timeTable` (is it a holiday?). If it is, use that value instead of the day of the week's value.
  var ymd = [dateParts.year, dateParts.month, dateParts.day].join('-');
  var dayArray = timeTable[ymd];
  var isHoliday = !(typeof dayArray === 'undefined');
  
  if(!isHoliday) { // If today isn't a holiday defined in `timeTable`, fall back to the Day of Week setting.
    dayArray = timeTable[dateParts.weekday];
  }
  
  var hour =  parseInt(dateParts.hour);
  var bandwidthSetting = parseInt(dayArray[hour]);
  
  console.log({
    isHoliday: isHoliday,
    weekDay: dateParts.weekday,
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
