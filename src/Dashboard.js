import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import './Dashboard.css'; // Import the CSS file

const pinIcon = new Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Ctext y="20" font-size="20"%3E📍%3C/text%3E%3C/svg%3E',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [loadingAirQuality, setLoadingAirQuality] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        const API_URL = 'https://iqairbackend.thedrop.top';
        const response = await axios.get(`${API_URL}/api/air-quality`);
        setData(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingAirQuality(false);
      }
    };

    const fetchDeviceData = async () => {
      try {
        const deviceResponse = await axios.get('https://api.vtbg.com');
        setDeviceData(deviceResponse.data);
      } catch (deviceErr) {
        console.error('Error fetching device data:', deviceErr);
        setDeviceData([]);
      } finally {
        setLoadingDevices(false);
      }
    };

    // Start both fetches independently
    fetchAirQualityData();
    fetchDeviceData();

    // Set up intervals for both fetches
    const airQualityInterval = setInterval(fetchAirQualityData, 10000);
    const deviceInterval = setInterval(fetchDeviceData, 10000);

    return () => {
      clearInterval(airQualityInterval);
      clearInterval(deviceInterval);
    };
  }, []);

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return {
      text: 'Добро',
      description: 'Качеството на въздуха е задоволително и представлява малък или никакъв риск.',
      color: '#00c853'
    };
    if (aqi <= 100) return {
      text: 'Умерено',
      description: 'Чувствителни хора трябва да избягват продължително излагане на открито.',
      color: '#ffd600'
    };
    if (aqi <= 150) return {
      text: 'Нездравословно за чувствителни групи',
      description: 'Чувствителни групи могат да изпитат здравословни ефекти.',
      color: '#ff9100'
    };
    if (aqi <= 200) return {
      text: 'Нездравословно',
      description: 'Всеки може да започне да изпитва здравословни ефекти.',
      color: '#ff3d00'
    };
    return {
      text: 'Много нездравословно',
      description: 'Предупреждение за спешни състояния. Цялото население е засегнат.',
      color: '#b71c1c'
    };
  };

  const handleShowGraph = (duration) => {
    if (duration === '24h') {
      window.open('https://grafana.vtbg.com/d/BHuEDmJ7k/last_24_h?orgId=1', '_blank');
    } else if (duration === '7d') {
      window.open('https://grafana.vtbg.com/d/8_jiKmJ7k/last-7d?orgId=1', '_blank');
    }
  };

  if (loadingAirQuality && loadingDevices) {
    return <div className="DashboardContainer">Зареждане...</div>;
  }

  if (error) return <div className="DashboardContainer">Грешка: {error}</div>;
  if (!data) return <div className="DashboardContainer">Няма налични данни</div>;

  const aqiStatus = getAQIStatus(data.current.pollution.aqius);

  return (
    <div className="DashboardContainer">
      <h1 className="Header">Качество на въздуха - {data?.city || 'Велико Търново'}</h1>

      {loadingAirQuality ? (
        <div className="InfoBox" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Зареждане на данни за качеството на въздуха...</p>
        </div>
      ) : error ? (
        <div className="InfoBox" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Грешка при зареждане на данните за качеството на въздуха: {error}</p>
        </div>
      ) : data && (
        <div className="DataGrid">
          <div className="Card">
            <h3 className="CardTitle">Индекс за качество на въздуха</h3>
            <div className="AQIIndicator" style={{ color: aqiStatus.color }}>
              {data.current.pollution.aqius}
            </div>
            <div style={{ marginTop: '0.5rem', color: aqiStatus.color }}>
              {aqiStatus.text}
            </div>
          </div>
          
          <div className="Card">
            <h3 className="CardTitle">Температура</h3>
            <div className="Value">{data.current.weather.tp}°C</div>
          </div>
        </div>
      )}

      <MapContainer className="MapContainer" center={[43.067, 25.620]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {!loadingDevices && deviceData.length > 0 && deviceData.map(device => {
          const [lat, lng] = device.location.split(',').map(Number);
          return (
            <Marker key={device.id} position={[lat, lng]} icon={pinIcon}>
              <Popup>
                <div className="PopupContent">
                  <h4>{device.name}</h4>
                  <p><strong>Location:</strong> {device.location}</p>
                  <p><strong>Time:</strong> {new Date(device.time).toLocaleString()}</p>
                  <p style={{ color: device.pm10 <= 20 ? '#00c853' : device.pm10 <= 50 ? '#ffd600' : device.pm10 <= 100 ? '#ff9100' : '#b71c1c' }}>
                    <strong>PM10:</strong> {device.pm10} µg/m³
                  </p>
                  <p style={{ color: device.pm25 <= 10 ? '#00c853' : device.pm25 <= 25 ? '#ffd600' : device.pm25 <= 50 ? '#ff9100' : device.pm25 <= 100 ? '#ff3d00' : '#b71c1c' }}>
                    <strong>PM2.5:</strong> {device.pm25} µg/m³
                  </p>
                  <p><strong>Temperature:</strong> {device.temp}°C</p>
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => handleShowGraph('24h')} style={{ marginRight: '5px' }}>
                      Show Graph for 24h
                    </button>
                    <button onClick={() => handleShowGraph('7d')}>
                      Show Graph for 7 Days
                    </button>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                    <strong>PM10 Levels:</strong>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Value</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>0-20</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Добро качество на въздуха</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>21-50</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Умерено</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>51-100</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Нездравословно за чувствителни</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>101-200</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Нездравословно</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>201-300</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Много нездравословно</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>&gt;300</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Опасно</td>
                        </tr>
                      </tbody>
                    </table>
                    
                    <strong>PM2.5 Levels:</strong>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Value</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>0-10</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Добро качество на въздуха</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>11-25</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Умерено</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>26-50</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Нездравословно за чувствителни</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>51-100</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Нездравословно</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>101-150</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Много нездравословно</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>&gt;150</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Опасно</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {!loadingDevices && deviceData.length === 0 && (
        <div className="InfoBox" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Данните от устройствата в момента не са налични. Моля, опитайте по-късно.</p>
        </div>
      )}

      <div className="InfoBox">
        <div className="InfoIcon">i</div>
        <a 
          className="InfoLink"
          href="https://www.airnow.gov/aqi/aqi-basics/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Научете повече за Индекса за качество на въздуха (AQI) и как той влияе на здравето
        </a>
      </div>

      <div className="AQIScale">
        <h3>Ръководство за Индекса на качество на въздуха (AQI):</h3>
        
        <div className="ScaleItem" style={{ background: '#f1f8e9' }}>
          <div className="FaceIcon" style={{ background: '#00c853' }}>
            <span role="img" aria-label="happy">😊</span>
          </div>
          <div className="ScaleContent">
            <strong>0-50: Добро</strong>
            <div className="ScaleDescription">
              Качеството на въздуха е задоволително и представлява малък или никакъв риск. 
              Препоръчва се проветряване на дома.
            </div>
          </div>
        </div>

        <div className="ScaleItem" style={{ background: '#fff8e1' }}>
          <div className="FaceIcon" style={{ background: '#ffd600' }}>
            <span role="img" aria-label="moderate">😐</span>
          </div>
          <div className="ScaleContent">
            <strong>51-100: Умерено</strong>
            <div className="ScaleDescription">
              Чувствителни хора трябва да избягват продължително излагане на открито. 
              При респираторни симптоми като кашлица или задух, останете на закрито.
            </div>
          </div>
        </div>

        <div className="ScaleItem" style={{ background: '#fff3e0' }}>
          <div className="FaceIcon" style={{ background: '#ff9100' }}>
            <span role="img" aria-label="unhealthy-sensitive">😷</span>
          </div>
          <div className="ScaleContent">
            <strong>101-150: Нездравословно за чувствителни групи</strong>
            <div className="ScaleDescription">
              Чувствителни групи могат да изпитат здравословни ефекти. 
              Хора с респираторни заболявания трябва да ограничат престоя на открито.
            </div>
          </div>
        </div>

        <div className="ScaleItem" style={{ background: '#ffebee' }}>
          <div className="FaceIcon" style={{ background: '#ff3d00' }}>
            <span role="img" aria-label="unhealthy">🤢</span>
          </div>
          <div className="ScaleContent">
            <strong>151-200: Нездравословно</strong>
            <div className="ScaleDescription">
              Всеки може да започне да изпитва здравословни ефекти. 
              Чувствителните групи могат да изпитат по-сериозни здравословни ефекти.
            </div>
          </div>
        </div>

        <div className="ScaleItem" style={{ background: '#ffcdd2' }}>
          <div className="FaceIcon" style={{ background: '#b71c1c' }}>
            <span role="img" aria-label="very-unhealthy">😨</span>
          </div>
          <div className="ScaleContent">
            <strong>201+: Много нездравословно</strong>
            <div className="ScaleDescription">
              Предупреждение за спешно състояние. Цялото население е вероятно да бъде засегнато. 
              Избягвайте всякакви дейности на открито.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
