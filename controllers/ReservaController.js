const reserva = require('../model/Reservamodel');

function getReserva(db, _id,req, callback){
    reserva.getReservas(db, _id,req, callback);
    
}
function getReserva2(db, _id,req, callback){
    reserva.getReservas2(db, _id,req, req, callback);
    
}

function VerReserva(db, socket,callback){ 
    reserva.VerReservas(db, socket.request.user.username,callback);
}


module.exports ={
    getReserva,
    getReserva2,
    VerReserva,
    
}