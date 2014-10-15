var ObjectID = require('mongodb').ObjectID;  //imports the various required packages (objectID function from the MongoDB package)
CollectionDriver = function(db) {   //
  this.db = db;
};
//^This function defines the CollectionDriver constructor method; it stores a MongoDB client instance for later use. In JavaScript, this is a reference to the current context, just like self in Objective-C.
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};
//This section defines a helper method getCollection to obtain a Mongo collection by name. You define class methods by adding functions to prototype.
//db.collection(name,callback) fetches the collection object and returns the collection — or an error — to the callback.
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};
//CollectionDriver.prototype.findAll gets the collection in line A above, and if there is no error such as an inability to access the MongoDB server, it calls find() on it in line B above. This returns all of the found objects.
//find() returns a data cursor that can be used to iterate over the matching objects. find() can also accept a selector object to filter the results. toArray() organizes all the results in an array and passes it to the callback. This final callback then returns to the caller with either an error or all of the found objects in the array.
CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};
//In line A above, CollectionDriver.prototype.get obtains a single item from a collection by its _id. Similar to prototype.findAll method, this call first obtains the collection object then performs a findOne against the returned object. Since this matches the _id field, a find(), or findOne() in this case, has to match it using the correct datatype.
//MongoDB stores _id fields as BSON type ObjectID. In line C above, ObjectID() (C) takes a string and turns it into a BSON ObjectID to match against the collection. However, ObjectID() is persnickety and requires the appropriate hex string or it will return an error: hence, the regex check up front in line B.
//This doesn’t guarantee there is a matching object with that _id, but it guarantees that ObjectID will be able to parse the string. The selector {'_id':ObjectID(id)} matches the _id field exactly against the supplied id.
exports.CollectionDriver = CollectionDriver;
//This line declares the exposed, or exported, entities to other applications that list collectionDriver.js as a required module.