import { useEffect, useState } from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from 'recharts';

import Navbar from './Navbar';
import Header from './Header';
import './Dashboard.css';
import { Cable, SquareActivityIcon, ZapIcon } from 'lucide-react';

function Dashboard() {
  const [stations, setStations] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [viewMode, setViewMode] = useState('hour'); // 'minute' | 'hour' | 'day'
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch('/api/GetStations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStations(data);
      } catch (err) {
        console.error('Failed to fetch stations', err);
      }
    };
    fetchStations();
  }, [token]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/GetActivity', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setActivityLog(data);
      } catch (err) {
        console.error('Failed to fetch activity log', err);
      }
    };
    fetchActivity();
  }, [token]);

  const uniqueConnectors = new Set(stations.map(s => s.ConnectorType)).size;
  const activeCount = stations.filter(s => s.Status.toLowerCase() === 'active').length;
  const totalPowerOutput = stations.reduce((sum, s) => sum + s.PowerOutput, 0);

  const groupActivityData = () => {
    const grouped = {};

    activityLog.forEach(entry => {
      const date = new Date(entry.timestamp);
      let key;

      switch (viewMode) {
        case 'minute':
          key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          break;
        case 'hour':
          key = date.toLocaleTimeString([], { hour: '2-digit' });
          break;
        case 'day':
        default:
          key = date.toLocaleDateString();
          break;
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
    });

    return Object.entries(grouped).map(([time, count]) => ({ time, count }));
  };

  const graphData = groupActivityData();

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="main-content">
        <Header />
        <div className="container">
          <div className="left-column">
            <div className="main-box">
              <div className="graph-header">
                <h2>Activity Over Time</h2>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <option value="minute">Minute</option>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#00ff88" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bottom-row">
              <div className="small-box">
                <Cable size={'5em'} color='#33DA9B'/><br/>
                <h3>{uniqueConnectors}</h3>
                <p>Unique Connector Types</p>
              </div>
              <div className="small-box">
                <SquareActivityIcon size={'5em'} color='#33DA9B'/><br/>
                <h3 className='h3'>{activeCount} / {stations.length}</h3>
                <p>Active / Total Stations</p>
              </div>
              <div className="small-box">
                <ZapIcon size={'5em'} color='#33DA9B'/><br/>
                <h3>{totalPowerOutput} kW</h3>
                <p>Total Power Output</p>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="activity-box">
              <h2>Recent Activity</h2>
              <div className="activity-log">
                {activityLog.length === 0 ? (
                  <p>No recent activity</p>
                ) : (
                  activityLog.map((entry, index) => (
                    <div key={index} className="activity-entry">
                      <p><strong>{entry.action}</strong> <em>{entry.stationName}</em></p>
                      <p className="timestamp">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{" "}
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
