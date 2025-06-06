import { useRef, useState, useEffect } from "react"
import Header from './Header'
import Navbar from './Navbar'
import './Station.css'
import { LucideFuel, RefreshCwIcon, List } from 'lucide-react';
import BackendURL from "./URL";

function Stations() {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [editMessage, setEditMessage] = useState("Click on a station to edit it.");
    const [message, setMessage] = useState("");
    const formRef = useRef();

    const handleRowClick = (station) => {
        setSelectedStation(station);
    };


    const FetchStations = async () => {
        try {
            const res = await fetch(`${BackendURL}/api/GetStations`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                throw new Error("Unauthorized or failed to fetch");
            }

            const data = await res.json();
            setStations(data);
        } catch (err) {
            console.error("Failed to fetch stations:", err);
        }
    };


    useEffect(() => {
        FetchStations();
    }, []);


    const handleDelete = async (Name, e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BackendURL}/api/DeleteStation`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ Name }),
            });

            const data = await res.json();
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                alert("Session expired. Please log in again.");
                window.location.href = '/'; 
            }

            if (res.ok) {
                setSelectedStation(null);
                FetchStations();
                setEditMessage(data.Data);
            } else {
                setEditMessage(data.error);
            }
        } catch (error) {
            setEditMessage(`${error} : Something went wrong. Try again later.`);
        }
    };

    const handleUpdateStation = async (e) => {
        e.preventDefault();

        const form = e.target;
        const updatedStation = {
            Name: form.Name.value,
            Status: form.Status.value,
            PowerOutput: parseFloat(form.PowerOutput.value),
            ConnectorType: form.ConnectorType.value,
            Latitude: parseFloat(form.Latitude.value),
            Longitude: parseFloat(form.Longitude.value),
        };

        try {
            const res = await fetch(`${BackendURL}/api/UpdateStation`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(updatedStation),
            });

            const data = await res.json();
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                alert("Session expired. Please log in again.");
                window.location.href = '/'; 
            }

            if (res.ok) {
                setEditMessage("Station updated successfully.");
                FetchStations();
                setSelectedStation(null);
            } else {
                setEditMessage(data.error);
            }
        } catch (err) {
            setEditMessage(`${err} : Something went wrong. Try again later.`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const Name = e.target.Name.value;
        const Latitude = parseFloat(e.target.Latitude.value);
        const Longitude = parseFloat(e.target.Longitude.value);
        const Status = e.target.Status.value;
        const PowerOutput = parseFloat(e.target.PowerOutput.value);
        const ConnectorType = e.target.ConnectorType.value;

        if (!Name || !Status || !ConnectorType) {
            return setMessage("Please fill all the fields.");
        }

        if (isNaN(Latitude) || isNaN(Longitude) || isNaN(PowerOutput)) {
            setMessage("Please enter valid numbers for location and power output.");
            return;
        }

        try {
            const res = await fetch(`${BackendURL}/api/AddStation`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    Name,
                    Latitude,
                    Longitude,
                    Status,
                    PowerOutput,
                    ConnectorType,
                }),
            });

            const data = await res.json();
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                alert("Session expired. Please log in again.");
                window.location.href = '/'; 
            }

            if (res.ok) {
                setMessage(data.Data);
                formRef.current.reset();
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            setMessage(`${error} :Something went wrong. Try again later.`);
        }
    };


    return (
        <div className='main'>
            <Navbar />
            <div className='content'>
                <Header />
                <div className='stationview'>
                    <div className="leftpanel">
                        <div className='map'>
                            <div className="tableview">
                                <div className="mapheader">
                                    <List />Listing of all stations added by You.
                                    <button className="button" onClick={FetchStations}>
                                        <div style={{ backgroundColor: '#141414', padding: '0.5em' }}>
                                            <RefreshCwIcon color="#33DA9B" />
                                        </div>
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table className="station-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>PowerOutput</th>
                                                <th>ConnectorType</th>
                                                <th>Latitude</th>
                                                <th>Longitude</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stations.map((station, index) => (
                                                <tr key={index} className="clickable-row" onClick={() => handleRowClick(station)} style={{ cursor: "pointer" }}>
                                                    <td>{station.Name}</td>
                                                    <td>{station.Status}</td>
                                                    <td>{station.PowerOutput}</td>
                                                    <td>{station.ConnectorType}</td>
                                                    <td>{station.Latitude}</td>
                                                    <td>{station.Longitude}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="viewer">
                            {selectedStation ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdateStation(e); }}>
                                    <h3>Edit Station</h3>
                                    <div className="form-columns">
                                        <div className="form-column">
                                            <div>
                                                <label><strong>Name:</strong></label>
                                                <input type="text" name="Name" value={selectedStation.Name} className="input-field" readOnly />
                                            </div>

                                            <div>
                                                <label><strong>Status:</strong></label>
                                                <input type="text" name="Status" value={selectedStation.Status} onChange={(e) => setSelectedStation({ ...selectedStation, Status: e.target.value })} className="input-field" />
                                            </div>

                                            <div>
                                                <label><strong>Power Output:</strong></label>
                                                <input type="text" name="PowerOutput" value={selectedStation.PowerOutput} onChange={(e) => setSelectedStation({ ...selectedStation, PowerOutput: e.target.value })} className="input-field" />
                                            </div>
                                        </div>
                                        <div className="form-column">
                                            <div>
                                                <label><strong>Connector Type:</strong></label>
                                                <input type="text" name="ConnectorType" value={selectedStation.ConnectorType} onChange={(e) => setSelectedStation({ ...selectedStation, ConnectorType: e.target.value })} className="input-field" />
                                            </div>

                                            <div>
                                                <label><strong>Latitude:</strong></label>
                                                <input type="text" name="Latitude" value={selectedStation.Latitude} onChange={(e) => setSelectedStation({ ...selectedStation, Latitude: e.target.value })} className="input-field" />
                                            </div>

                                            <div>
                                                <label><strong>Longitude:</strong></label>
                                                <input type="text" name="Longitude" value={selectedStation.Longitude} onChange={(e) => setSelectedStation({ ...selectedStation, Longitude: e.target.value })} className="input-field" />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: "10px" }}>
                                        <button type="submit" className="submitbutton">Update Station</button>
                                        <button type="button" className="submitbutton" onClick={(e) => handleDelete(selectedStation.Name, e)}>Delete Station</button>
                                    </div>
                                </form>
                            ) : (
                                <p>{editMessage}</p>
                            )}
                        </div>

                    </div>

                    <div className='edit'>
                        Add New Station
                        <div className='img'>
                            <LucideFuel size={'6em'} color='#33DA9B' />
                        </div>
                        <form onSubmit={handleSubmit} ref={formRef}>
                                <input type="text" placeholder="Name" className="input-field" id="Name" name="Name" />
                                <hr className="hr" />
                            <div>
                            </div>
                            <div>
                                <input type="text" placeholder="Latitude" className="input-field" id="Latitude" name="Latitude" />
                                <hr className="hr" />
                            </div>
                            <div>
                                <input type="text" placeholder="Longitude" className="input-field" id="Longitude" name="Longitude" />
                                <hr className="hr" />
                            </div>
                            <div>
                                <input type="text" placeholder="Status" className="input-field" id="Status" name="Status" />
                                <hr className="hr" />
                            </div>
                            <div>
                                <input type="text" placeholder="PowerOutput" className="input-field" id="PowerOutput" name="PowerOutput" />
                                <hr className="hr" />
                            </div>
                            <div>
                                <input type="text" placeholder="ConnectorType" className="input-field" id="ConnectorType" name="ConnectorType" />
                                <hr className="hr" />
                            </div>
                            <div>
                                <button type="submit" className="submitbutton">ADD</button><br />
                                {message}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Stations