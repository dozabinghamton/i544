import { SensorType, Sensor, SensorReading,
  SensorTypeSearch, SensorSearch, SensorReadingSearch,
      } from './validators.js';

import { Errors, } from 'cs544-js-utils';

import * as mongo from 'mongodb';

// const { MongoClient } = require("mongodb");

// const uri = "mongodb://localhost:27017/sensors";

/** All that this DAO should do is maintain a persistent data for sensors.
*
*  Most routines return an errResult with code set to 'DB' if
*  a database error occurs.
*/

/** return a DAO for sensors at URL mongodbUrl */
export async function
makeSensorsDao(mongodbUrl: string) : Promise<Errors.Result<SensorsDao>> {
 return SensorsDao.make(mongodbUrl);
}

//the types stored within collections
type DbSensorType = SensorType & { _id: string };
type DbSensor = Sensor & { _id: string };
type DbSensorReading=SensorReading & {_id:string};

//options for new MongoClient()
const MONGO_OPTIONS = {
 ignoreUndefined: true,  //ignore undefined fields in queries
};

export class SensorsDao {

 // creating collection for dbSensorTypes,dbSensor,dbSensorReading 
 private constructor(private readonly client: mongo.MongoClient,
   private readonly dbSensorTypes: mongo.Collection<DbSensorType>,
   private readonly dbSensor:mongo.Collection<DbSensor>,
   private readonly dbSensorReading:mongo.Collection<DbSensorReading>
   ) {
  
 }

 /** factory method
  *  Error Codes: 
  *    DB: a database error was encountered.
  */

 static async make(dbUrl: string) : Promise<Errors.Result<SensorsDao>> {
   try {
     const clientConnection = await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
     const db = clientConnection.db();
     const sensorTypes = db.collection<DbSensorType>(SENSORS_TYPE_COLLECTIONS);
     const sensors=db.collection<DbSensor>(SENSORS_COLLECTIONS);
     const sensorReadings=db.collection<DbSensorReading>(SENSORS_READING);
     //3 Collections made to Store.

     await sensorTypes.createIndex(' id,', { unique: true }); // Id that is unique
     await sensors.createIndex('id', { unique: true }); // Id  that is unique
     await sensorReadings.createIndex('id',{unique:true}); //Id that is unique
     return Errors.okResult(new SensorsDao(clientConnection,sensorTypes,sensors,sensorReadings));
     
   } catch (error) {
     return Errors.errResult(error.message, 'DB Error');
   }
 }

 /** Release all resources held by this dao.
  *  Specifically, close any database connections.
  *  Error Codes: v
  *    DB: a database error was encountered.
  */
 //Just Clossing the client connection..
 async close() : Promise<Errors.Result<void>> {
   try {
     await this.client.close();
     return Errors.VOID_RESULT;
   }
   catch (e) {
     return Errors.errResult(e.message, 'DB');
   }
 }

 /** Clear out all sensor info in this database
  *  Error Codes: 
  *    DB: a database error was encountered.
  */

 //Clear() drop() this method works on collection and it will drop all the collections on which they are applied.
 async clear(): Promise<Errors.Result<void>> {
   try {
     // Drop() removes the collections from DB.
     await this.dbSensorTypes.drop();
     await this.dbSensor.drop();
    await this.dbSensorReading.drop();
     return Errors.VOID_RESULT;
   } catch (error) {
     return Errors.errResult(error.message, 'DB');
   }
 }
 
 /** Add sensorType to this database.
  *  Error Codes: 
  *    EXISTS: sensorType with specific id already exists in DB.
  *    DB: a database error was encountered.
  */

 async addSensorType(sensorType: SensorType): Promise<Errors.Result<SensorType>> {
   const collectionsOfSensorsType = this.dbSensorTypes; //Collection
   const { id, ...rest } = sensorType; //Object Destrcuturing Syntax to seperate id and rest of properties.
   const dBObject: DbSensorType = { ...rest, _id: id, id: id };  // Set both _id and id // Used Web to get know how object destructuring Works, _id is sensorID and id is DB UNique Id through which we can get document
 
   try {
     await collectionsOfSensorsType.insertOne(dBObject); // Pushing into collectionsOf SensorTypes.
     return Errors.okResult(sensorType); // Returning  SensorType added.
   } catch (error) {
     if (error.code === MONGO_DUPLICATE_CODE) {
       return Errors.errResult('Duplicated SensorType Detected.', 'EXISTS');
     }
 
     return Errors.errResult(error.message, 'DB');
   }
 }
 
 /** Add sensor to this database.
  *  Error Codes: 
  *    EXISTS: sensor with specific id already exists in DB.
  *    DB: a database error was encountered.
  */
 async addSensor(sensor: Sensor): Promise<Errors.Result<Sensor>> {
  const collectionOfSensors = this.dbSensor; //Collection Of Sensor.
  const { id, ...rest } = sensor; // Same Object Destrcuturing Followed.
  const dBObject: DbSensor = { ...rest, _id: id, id }; //Rest all are copied into new oBject

  try {
    await collectionOfSensors.insertOne(dBObject);
    return Errors.okResult(sensor);
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_CODE) {
      return Errors.errResult('Duplicated Sensor Detected', 'EXISTS');
    }

    return Errors.errResult(error.message, 'DB');
  }
}
 /** Add sensorReading to this database.
  *  Error Codes: 
  *    EXISTS: reading for same sensorId and timestamp already in DB.
  *    DB: a database error was encountered.
  */
 async addSensorReading(sensorReading: SensorReading): Promise<Errors.Result<SensorReading>> {
  try {
    const collection = this.dbSensorReading;
    const { sensorId, ...rest } = sensorReading;
    const dBObject: DbSensorReading = { _id: sensorId,sensorId,...rest};
    await collection.insertOne(dBObject);
    return Errors.okResult(sensorReading);
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_CODE) {
      
      return Errors.errResult('Duplicated SensorReadings Detected', 'EXISTS');
    }
    return Errors.errResult(error.message, 'DB');
  }
}
/** Find sensor-types which satisfy search. Returns [] if none. 
*  Note that all primitive SensorType fields can be used to filter.
*  The returned array must be sorted by sensor-type id.
*  Error Codes: 
*    DB: a database error was encountered.
*/
async findSensorTypes(search: SensorTypeSearch): Promise<Errors.Result<SensorType[]>> {
 try {
   const collection = this.dbSensorTypes;
   const query: { [key: string]: any } = {};
   if (search.id) {
     query._id = search.id;  
   }
    const projection = { _id: 0 };  //0 means to exlude and 1 means to Include
    const result = await collection.find(query).project(projection).sort({ id: 1 });
     
      
    const sensorTypes: SensorType[] = await result.toArray().then((x) => {
     return x.map((doc) => {
      return {
         id: doc.id,
         manufacturer: doc.manufacturer,
         modelNumber: doc.modelNumber,
         quantity: doc.quantity,
         unit: doc.unit,   
         limits: doc.limits  
       };
     });
   });


   return Errors.okResult(sensorTypes);
 } catch (error) {
  
   return Errors.errResult(error.message, 'DB');
 }
}

 /** Find sensors which satify search. Returns [] if none. 
  *  Note that all primitive Sensor fields can be used to filter.
  *  The returned array must be sorted by sensor-type id.
  *  Error Codes: 
  *    DB: a database error was encountered.
  */
 async findSensors(search: SensorSearch): Promise<Errors.Result<Sensor[]>> {
  try {
    const collection = this.dbSensor;

    const query: { [key: string]: any } = {};
    if (search.id) {
      query._id = search.id;
    }
    const sensors = await collection.find(query).toArray();
    sensors.sort((a, b) => a.sensorTypeId.localeCompare(b.sensorTypeId));

    return Errors.okResult(sensors);
  } catch (error) {
    return Errors.errResult(error.message, 'DB');
  }
}
 /** Find sensor readings which satisfy search. Returns [] if none. 
  *  The returned array must be sorted by timestamp.
  *  Error Codes: 
  *    DB: a database error was encountered.
  */
 async findSensorReadings(search: SensorReadingSearch): Promise<Errors.Result<SensorReading[]>> {
   try {
     const collection = this.dbSensorReading;
 
     const query: { [key: string]: any } = {
       sensorId: search.sensorId,
       timestamp: { $gte: search.minTimestamp, $lte: search.maxTimestamp },
       value: { $gte: search.minValue, $lte: search.maxValue }
     };
         const sensorReadings = await collection.find(query).sort({ timestamp: 1 }).toArray();

 
     return Errors.okResult(sensorReadings);
   } catch (error) {
     return Errors.errResult(error.message, 'DB');
   }
 }
 
} 

//mongo err.code on inserting duplicate entry
const MONGO_DUPLICATE_CODE = 11000;
const SENSORS_TYPE_COLLECTIONS = 'SensorType';
const SENSORS_COLLECTIONS='Sensors';
const SENSORS_READING='SensorsReadings'



//Note to Grader-> Professor has provided the very similar example.. I referred that while implementing this.

// 3 test Cases are failing. Each 1 for sensors search, sensors reading search and sensor Types Search.




