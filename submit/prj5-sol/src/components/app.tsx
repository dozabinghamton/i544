import React, { ChangeEvent, FormEvent, useState } from 'react';

import { makeSensorsWs, SensorsWs } from '../lib/sensors-ws.js';

import Tab from './tab.js';

import SENSOR_FIELDS from './sensor-fields.js';


type AppProps = {
  wsUrl: string,
};


interface MyComponentProps {
  ws: SensorsWs;
}

interface SensorType {
  id: string;
  manufacturer: string;
  modelNumber: string;
  quantity: string;
  unit: string;
  min: string;
  max: string;
}

const AddSensorTypeForm: React.FC<MyComponentProps> = ({ ws }) => {

  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([]);

  const [sensorType, setSensorType] = useState<SensorType>({
    id: '',
    manufacturer: '',
    modelNumber: '',
    quantity: '',
    unit: '',
    min: '',
    max: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSensorType({
      ...sensorType,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = sensorType
    const sensorData: Record<string, string> = {
      id: sensorType.id,
      manufacturer: sensorType.manufacturer,
      modelNumber: sensorType.modelNumber,
      quantity: sensorType.quantity,
      unit: sensorType.unit,
      min: sensorType.min,
      max: sensorType.max,
    };
    if (sensorType.id.trim() != ""
      && sensorType.manufacturer.trim() != ""
      && sensorType.modelNumber.trim() != ""
      && sensorType.quantity.trim() != ""
      && sensorType.unit.trim() != ""
      && sensorType.min.trim() != ""
      && sensorType.max.trim() != "") {
      setSensorTypes([...sensorTypes, sensorType]);
    }
    //const responseFromAPI = await ws.addSensorType(sensorData);

    // console.log(ws, sensorData, responseFromAPI);
    // if (responseFromAPI.isOk) {

    // } else {

    // }
  };


  return (
    <>
      <form className="grid-form" id="addSensorType-form" name="addSensorType-form" onSubmit={handleSubmit}>
        <label htmlFor="addSensorType-id">Sensor Type ID <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="id" value={sensorType.id} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>

        <label htmlFor="addSensorType-manufacturer">Manufacturer <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="manufacturer" value={sensorType.manufacturer} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>

        <label htmlFor="addSensorType-modelNumber">Model Number <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="modelNumber" value={sensorType.modelNumber} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>

        <label htmlFor="addSensorType-quantity-error">Quantity  <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="quantity" value={sensorType.quantity} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>

        <label htmlFor="addSensorType-min-error">Unit  <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="unit" value={sensorType.unit} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>

        <label htmlFor="addSensorType-max-error">Min Limit  <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="min" value={sensorType.min} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>
        <label htmlFor="addSensorType-max-error">Max Limit  <span className="required" title="Required">*</span></label>
        <span>
          <input id="addSensorType-id" name="max" value={sensorType.max} onChange={handleChange} /><br />
          <span id="addSensorType-id-error" className="addSensorType-errors error"></span>
        </span>

        <button type="submit">Add Sensor Type</button>
      </form>

      {
        sensorTypes.map(item => {
          return (
            <div>
              <dl id="findSensorTypes-results" className="result">
                <dt>Sensor Type ID  &nbsp;&nbsp; &nbsp;{item.id}</dt>

                <dt>Sensor Type ID  &nbsp;&nbsp; &nbsp;{item.id}</dt>

                <dt>Sensor Type ID  &nbsp;&nbsp; &nbsp;{item.id}</dt>

                <dt>Sensor Type ID  &nbsp;&nbsp; &nbsp;{item.id}</dt>


              </dl>
            </div>
          )
        })
      }
    </>
  );
}

interface Sensor {
  id: string;
  sensorTypeId: string;
  period: number;
  min: number;
  max: number;
}

const AddSensorForm: React.FC = () => {
  const [sensor, setSensor] = useState<Sensor>({
    id: '',
    sensorTypeId: '',
    period: 0,
    min: 0,
    max: 0
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSensor({
      ...sensor,
      [name]: name === 'period' || name === 'min' || name === 'max' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(sensor);
  };

  return (
    <form className="grid-form" id="addSensor-form" name="addSensor-form" onSubmit={handleSubmit}>
      <label htmlFor="addSensor-id">Sensor ID <span className="required" title="Required">*</span></label>
      <span>
        <input id="addSensor-id" name="id" value={sensor.id} onChange={handleChange} type="text" /><br />
        <span id="addSensor-id-error" className="addSensor-errors error"></span>
      </span>

      <label htmlFor="addSensor-sensorTypeId">Sensor Type ID <span className="required" title="Required">*</span></label>
      <span>
        <input id="addSensor-sensorTypeId" name="sensorTypeId" value={sensor.sensorTypeId} onChange={handleChange} type="text" /><br />
        <span id="addSensor-sensorTypeId-error" className="addSensor-errors error"></span>
      </span>

      <label htmlFor="addSensor-period">Period <span className="required" title="Required">*</span></label>
      <span>
        <input id="addSensor-period" name="period" value={sensor.period} onChange={handleChange} type="number" /><br />
        <span id="addSensor-period-error" className="addSensor-errors error"></span>
      </span>

      <label htmlFor="addSensor-min">Min Expected <span className="required" title="Required">*</span></label>
      <span>
        <input id="addSensor-min" name="min" value={sensor.min} onChange={handleChange} type="number" /><br />
        <span id="addSensor-min-error" className="addSensor-errors error"></span>
      </span>

      <label htmlFor="addSensor-max">Max Expected <span className="required" title="Required">*</span></label>
      <span>
        <input id="addSensor-max" name="max" value={sensor.max} onChange={handleChange} type="number" /><br />
        <span id="addSensor-max-error" className="addSensor-errors error"></span>
      </span>

      <button type="submit">Add Sensor</button>
    </form>
  );
}

interface SensorTypesFormState {
  id: string;
  manufacturer: string;
  modelNumber: string;
  quantity: string;
  unit: string;
}

const FindSensorTypesForm: React.FC = () => {
  const [formData, setFormData] = useState<SensorTypesFormState>({
    id: '',
    manufacturer: '',
    modelNumber: '',
    quantity: '',
    unit: ''
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <form className="grid-form" id="findSensorTypes-form" name="findSensorTypes-form" onSubmit={handleSubmit}>
      <label htmlFor="findSensorTypes-id">Sensor Type ID</label>
      <span>
        <input id="findSensorTypes-id" name="id" value={formData.id} onChange={handleChange} /><br />
        <span id="findSensorTypes-id-error" className="findSensorTypes-errors error"></span>
      </span>

      <label htmlFor="findSensorTypes-manufacturer">Manufacturer</label>
      <span>
        <input id="findSensorTypes-manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} /><br />
        <span id="findSensorTypes-manufacturer-error" className="findSensorTypes-errors error"></span>
      </span>

      <label htmlFor="findSensorTypes-modelNumber">Model Number</label>
      <span>
        <input id="findSensorTypes-modelNumber" name="modelNumber" value={formData.modelNumber} onChange={handleChange} /><br />
        <span id="findSensorTypes-modelNumber-error" className="findSensorTypes-errors error"></span>
      </span>

      <label htmlFor="findSensorTypes-quantity">Quantity</label>
      <span>
        <input id="findSensorTypes-quantity" name="quantity" value={formData.quantity} onChange={handleChange} /><br />
        <span id="findSensorTypes-quantity-error" className="findSensorTypes-errors error"></span>
      </span>

      <label htmlFor="findSensorTypes-unit">Unit</label>
      <span>
        <input id="findSensorTypes-unit" name="unit" value={formData.unit} onChange={handleChange} /><br />
        <span id="findSensorTypes-unit-error" className="findSensorTypes-errors error"></span>
      </span>

      <button type="submit">Find Sensor Types</button>
    </form>
  );
}

interface SensorsFormState {
  id: string;
  sensorTypeId: string;
}

const FindSensorsForm: React.FC = () => {
  const [formData, setFormData] = useState<SensorsFormState>({
    id: '',
    sensorTypeId: ''
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    console.log(formData);
  };

  return (
    <form className="grid-form" id="findSensors-form" name="findSensors-form" onSubmit={handleSubmit}>
      <label htmlFor="findSensors-id">Sensor ID</label>
      <span>
        <input id="findSensors-id" name="id" value={formData.id} onChange={handleChange} /><br />
        <span id="findSensors-id-error" className="findSensors-errors error"></span>
      </span>

      <label htmlFor="findSensors-sensorTypeId">Sensor Type ID</label>
      <span>
        <input id="findSensors-sensorTypeId" name="sensorTypeId" value={formData.sensorTypeId} onChange={handleChange} /><br />
        <span id="findSensors-sensorTypeId-error" className="findSensors-errors error"></span>
      </span>

      <button type="submit">Find Sensors</button>
    </form>
  );
}

export default function App(props: AppProps) {
  const ws = makeSensorsWs(props.wsUrl);
  const [selectedId, selectTab] = React.useState('addSensorType');

  return (
    <div className="tabs">
      <Tab id="test" label="Add Sensor Test Type"
        isSelected={selectedId === 'addSensorType'}
        select={() => selectTab("addSensorType")}
      >
        <AddSensorTypeForm ws={ws} />
      </Tab>
      <Tab id="addSensor" label="Add Sensor"
        isSelected={selectedId === 'addSensor'}
        select={() => selectTab("addSensor")}>
        <AddSensorForm />
      </Tab>
      <Tab id="findSensorTypes" label="Find Sensor Types"
        isSelected={selectedId === 'findSensorTypes'}
        select={() => selectTab("findSensorTypes")}>
        <FindSensorTypesForm />
      </Tab>
      <Tab id="findSensors" label="Find Sensors"
        isSelected={selectedId === 'findSensors'}
        select={() => selectTab("findSensors")}>
        < FindSensorsForm />
      </Tab>
    </div>
  );
}

