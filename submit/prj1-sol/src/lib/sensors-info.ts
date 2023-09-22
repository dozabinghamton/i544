import { Errors, Checkers } from 'cs544-js-utils';
import { validateFindCommand, SensorType, Sensor, SensorReading, makeSensorType, makeSensor, makeSensorReading } from './validators.js';

type FlatReq = Checkers.FlatReq; // Dictionary mapping strings to strings

// Marks T as having been run through validate()
type Checked<T> = Checkers.Checked<T>;

/*********************** Top Level Sensors Info ************************/
// 3 Dictionaries are used here as to store sensorTypes, sensors and sensorReadings respectively.
export class SensorsInfo {
  private sensorTypes: Record<string, SensorType> ;
  private sensors: Record<string, Sensor> ;
  private sensorReadings: Record<string, SensorReading>;

  constructor() {
    // TODO: Initialized empty
    this.sensorTypes = {};
    this.sensors = {};
    this.sensorReadings = {};
  }
// Clearing 
  clear(): Errors.Result<string[]> {
    // Clearing all the data
    this.sensorTypes = {};
    this.sensors = {};
    this.sensorReadings = {};
    return Errors.okResult([]);
  }
 //Adding Sensors Type .. If the sensor is already present then we wont be add with same unique id as stated otherwise we will add it and return as said.
  addSensorType(req: Record<string, string>): Errors.Result<SensorType[]> {
    const sensorTypeResult = makeSensorType(req); // Taking sensorType from req.
  
    if (sensorTypeResult.isOk) {
      const { val: sensorType } = sensorTypeResult;
  
      // Check if sensor ID already exists
      if (this.sensorTypes[sensorType.id]) {
        return Errors.errResult("ERROR",{code:"BAD_ID"}); // Here one error should be thrown as we have same sensorId and trying to add it with the same id.. Somehow not working as expected.
       
      }
  
      this.sensorTypes[sensorType.id] = sensorType; // Pushing to dictionary of sensorTypes with current sensor id
      return Errors.okResult([sensorType]); // Returning the sensorType if everything is fine
    } else {
      return sensorTypeResult;  // Return the error directly
    }
  }
  

 // Adding particular Sensor is said in the requirment nd same will return the sensor.
  addSensor(req: Record<string, string>): Errors.Result<Sensor[]> {
    const sensorResult = makeSensor(req); // Using Sensor as function gives us the data.
    if (!sensorResult.isOk) return sensorResult;

  
    const { val: sensor } = sensorResult;
    this.sensors[sensor.id] = sensor; // Pushing it to sensors dictionary as well

    return Errors.okResult([sensor]); // Returning on successfull adding of the things.
  }

  //Sensor reading addmethod adn returning particular newly added reading.
  addSensorReading(req: Record<string, string>): Errors.Result<SensorReading[]> {
    const sensorReadingResult = makeSensorReading(req);
    if (!sensorReadingResult.isOk) return sensorReadingResult;

    //const sensorReading = sensorReadingResult.val;
    const { val: sensorReading } = sensorReadingResult;
  
    const key = JSON.stringify({ sensorId: sensorReading.sensorId, timestamp: sensorReading.timestamp }); //Getting the timestamp of readings


    this.sensorReadings[key] = sensorReading; // Pushing the sensorReading with a key if matching the push will be done.

    return Errors.okResult([sensorReading]);
  }
  //Finding Sensor Type

  findSensorTypes(req: FlatReq): Errors.Result<SensorType[]> {
  
    const sensorReq = validateFindCommand('findSensorTypes', req);
    if (!sensorReq.isOk) return sensorReq;

    const filteredSensorTypes = Object.values(this.sensorTypes).filter((sensorType) => {
      for (const field in req) {
        if (field in sensorType && (sensorType as any)[field] !== req[field]) return false;
      }
      if (req.id && sensorType.id !== req.id) return false;
      if (req.manufacturer && sensorType.manufacturer !== req.manufacturer) return false;
      if (req.quantity && sensorType.quantity !== req.quantity) return false;
      return true;
    });

    filteredSensorTypes.sort((a, b) => a.id.localeCompare(b.id));
    return Errors.okResult(filteredSensorTypes);
  }

  // Finding the Sensors based on the requirements 

  findSensors(req: FlatReq): Errors.Result<Sensor[]> {

    const sensorRequired = validateFindCommand('findSensors', req);
    if (!sensorRequired.isOk) return sensorRequired;

    const requiredSensors = Object.values(this.sensors).filter((sensor) => {
      if (req.id && sensor.id !== req.id) return false;
      if (req.sensorTypeId && sensor.sensorTypeId !== req.sensorTypeId) return false;
      return true;
    });

    requiredSensors.sort((a, b) => a.id.localeCompare(b.id));
    return Errors.okResult(requiredSensors);
  }
  // Finding Reading particular to a sensor
  findSensorReadings(req: FlatReq): Errors.Result<SensorReading[]> {

    const validResult = validateFindCommand('findSensorReadings', req);
    if (!validResult.isOk) return validResult;

    const requiredSensorsReadings = Object.values(this.sensorReadings).filter(sensorReading => {
      const {
        sensorId,
        minTimestamp,
        maxTimestamp,
        value,
        minValue,
        maxValue
      } = req;
    
      if (sensorId && sensorReading.sensorId !== sensorId) return false;
      if (minTimestamp && sensorReading.timestamp < Number(minTimestamp)) return false;
      if (maxTimestamp && sensorReading.timestamp > Number(maxTimestamp)) return false;
      if (value && sensorReading.value !== Number(value)) return false;
      if (minValue && sensorReading.value < Number(minValue)) return false;
      if (maxValue && sensorReading.value > Number(maxValue)) return false;
    
      return true;
    });
    
    const filteredSensorsReadingByTimeStamp=requiredSensorsReadings.sort((a, b) => a.timestamp - b.timestamp); // Sorting this for the requirements
    return Errors.okResult(requiredSensorsReadings);
  }
}

/*********************** SensorsInfo Factory Functions *****************/

export function makeSensorsInfo(
  sensorTypes: FlatReq[] = [],
  sensors: FlatReq[] = [],
  sensorReadings: FlatReq[] = []
): Errors.Result<SensorsInfo> {
  const sensorsInfo = new SensorsInfo();
  const addResult = addSensorsInfo(sensorTypes, sensors, sensorReadings, sensorsInfo);
  return addResult.isOk ? Errors.okResult(sensorsInfo) : addResult;
}

export function addSensorsInfo(
  sensorTypes: FlatReq[],
  sensors: FlatReq[],
  sensorReadings: FlatReq[],
  sensorsInfo: SensorsInfo
): Errors.Result<void> {
  for (const sensorType of sensorTypes) {
    const result = sensorsInfo.addSensorType(sensorType);
    if (!result.isOk) return result;
  }
  for (const sensor of sensors) {
    const result = sensorsInfo.addSensor(sensor);
    if (!result.isOk) return result;
  }
  for (const reading of sensorReadings) {
    const result = sensorsInfo.addSensorReading(reading);
    if (!result.isOk) return result;
  }
  return Errors.VOID_RESULT;
}

/****************************** Utilities ******************************/

// TODO: add any utility functions or classes
