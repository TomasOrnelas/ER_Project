var mongoConfigs = require('./mongoConfigs');

function getBikes(db, _id, modelo, callback){
    var filters = {modelo:modelo, Reservada: false};

    if(_id !== undefined){
        console.log('no bike available')
        
        
    }else{
        filters.id = _id;
        db.collection('bikes').find(filters).toArray(function(err,result){
            callback(result);

        });
       
    }
}
module.exports = {
    getBikes,
}