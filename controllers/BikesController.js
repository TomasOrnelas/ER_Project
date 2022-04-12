const Bikes = require('../model/Bikesmodel');

function getBike(db, _id,req, callback){
    Bikes.getBikes(db, _id,req, callback);
    
}

module.exports ={
    getBike,
}