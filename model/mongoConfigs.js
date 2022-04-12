const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
var dbs;

module.exports = {
    connect: function (callback) {
        //Insert the connection string which was shared with you in moodle
        MongoClient.connect('mongodb://ER:ER123@cluster0-shard-00-00.2iigr.mongodb.net:27017,cluster0-shard-00-01.2iigr.mongodb.net:27017,cluster0-shard-00-02.2iigr.mongodb.net:27017/test?authSource=admin&replicaSet=atlas-wlvhze-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useNewUrlParser: true, useUnifiedTopology: true },function (err, database) {
            console.log('Connected the database on port 27017');
     
            dbs = database.db('ER');
            callback(err);
        })},
    getDB:function(){
        return dbs;
    }
}