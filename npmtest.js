var moment = require("moment");
var unique = require("uniq");

var myCoolDate = moment(myDate).format("LL");
var myDate = new Date();
console.log(myCoolDate);

var myList = [1,2,1,1,1,3,3,4,5,6,4,4,7];

var myUniqueList = unique(myList);
// console.log(myUniqueList);

module.exports = myUniqueList
