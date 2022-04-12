const { Socket } = require('socket.io');
var mongoConfigs = require('./mongoConfigs');

function getReservas(db, _id, user, callback){
    var filters = {UserID:user};

    if(_id !== undefined){
        console.log('no reserva available');      
    }else{
        
        filters.id = _id;
        db.collection('reservas').find(filters).toArray(function(err,result){
            callback(result);

        });
    }
}
function getReservas2(db, _id, user,id, callback){
    var filters = {UserID:user, _id:id};

    if(id !== undefined){
        console.log('no reserva available');      
    }else{
        
        filters.id = _id;
        filters.UserID=user
        db.collection('reservas').find(filters).toArray(function(err,result){
            callback(result);

        });
    }
}


function VerReservas(db, user, callback){
    var filters = {UserID:user};

    if(user !== undefined){
        filters.UserID = user;
            db.collection('reservas').find(filters).toArray(function(err,result){
           // console.log("OLA",result)
            callback(result);
        });
              
    }else{
        console.log('no reserva available1');
       
    }
}


module.exports = {
    getReservas,
    getReservas2,
    VerReservas,
   
}