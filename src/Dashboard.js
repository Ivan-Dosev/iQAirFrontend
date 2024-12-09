import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h1`
  color: #1e3c72;
  text-align: center;
  margin-bottom: 2rem;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h3`
  color: #666;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1e3c72;
  text-align: center;
`;

const AQIIndicator = styled.div`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: ${props => {
    if (props.aqi <= 50) return '#00c853';
    if (props.aqi <= 100) return '#ffd600';
    if (props.aqi <= 150) return '#ff9100';
    if (props.aqi <= 200) return '#ff3d00';
    return '#b71c1c';
  }};
`;

const AQIScale = styled.div`
  padding: 1rem;
  border-radius: 15px;
  background: white;
  margin-top: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ScaleItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.background || '#fff'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(10px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ScaleDescription = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
`;

const FaceIcon = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ScaleContent = styled.div`
  flex: 1;
`;

const InfoBox = styled.div`
  background: #f5f5f5;
  border-radius: 10px;
  padding: 1rem;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e0e0e0;
`;

const InfoIcon = styled.div`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  background: #1e3c72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
`;

const InfoLink = styled.a`
  color: #1e3c72;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${API_URL}/api/air-quality`);
        setData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
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
      description: 'Предупреждения за спешни състояния. Цялото население е засегнат.',
      color: '#b71c1c'
    };
  };

  if (loading) return <DashboardContainer>Зареждане...</DashboardContainer>;
  if (error) return <DashboardContainer>Грешка: {error}</DashboardContainer>;
  if (!data) return <DashboardContainer>Няма налични данни</DashboardContainer>;

  const aqiStatus = getAQIStatus(data.current.pollution.aqius);

  return (
    <DashboardContainer>
      <Header>Качество на въздуха - {data.city}</Header>
      <DataGrid>
        <Card>
          <CardTitle>Индекс за качество на въздуха</CardTitle>
          <AQIIndicator aqi={data.current.pollution.aqius}>
            {data.current.pollution.aqius}
          </AQIIndicator>
          <div style={{ marginTop: '0.5rem', color: aqiStatus.color }}>
            {aqiStatus.text}
          </div>
        </Card>
        
        <Card>
          <CardTitle>Температура</CardTitle>
          <Value>{data.current.weather.tp}°C</Value>
        </Card>
      </DataGrid>

      <InfoBox>
        <InfoIcon>i</InfoIcon>
        <InfoLink 
          href="https://www.airnow.gov/aqi/aqi-basics/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Научете повече за Индекса за качество на въздуха (AQI) и как той влияе на здравето
        </InfoLink>
      </InfoBox>

      <AQIScale>
        <h3>Ръководство за Индекса на качество на въздуха (AQI):</h3>
        
        <ScaleItem background="#f1f8e9">
          <FaceIcon color="#00c853">
            <span role="img" aria-label="happy">😊</span>
          </FaceIcon>
          <ScaleContent>
            <strong>0-50: Добро</strong>
            <ScaleDescription>
              Качеството на въздуха е задоволително и представлява малък или никакъв риск. 
              Препоръчва се проветряване на дома.
            </ScaleDescription>
          </ScaleContent>
        </ScaleItem>

        <ScaleItem background="#fff8e1">
          <FaceIcon color="#ffd600">
            <span role="img" aria-label="moderate">😐</span>
          </FaceIcon>
          <ScaleContent>
            <strong>51-100: Умерено</strong>
            <ScaleDescription>
              Чувствителни хора трябва да избягват продължително излагане на открито. 
              При респираторни симптоми като кашлица или задух, останете на закрито.
            </ScaleDescription>
          </ScaleContent>
        </ScaleItem>

        <ScaleItem background="#fff3e0">
          <FaceIcon color="#ff9100">
            <span role="img" aria-label="unhealthy-sensitive">😷</span>
          </FaceIcon>
          <ScaleContent>
            <strong>101-150: Нездравословно за чувствителни групи</strong>
            <ScaleDescription>
              Чувствителни групи могат да изпитат здравословни ефекти. 
              Хора с респираторни заболявания трябва да ограничат престоя на открито.
            </ScaleDescription>
          </ScaleContent>
        </ScaleItem>

        <ScaleItem background="#ffebee">
          <FaceIcon color="#ff3d00">
            <span role="img" aria-label="unhealthy">🤢</span>
          </FaceIcon>
          <ScaleContent>
            <strong>151-200: Нездравословно</strong>
            <ScaleDescription>
              Всеки може да започне да изпитва здравословни ефекти. 
              Чувствителните групи могат да изпитат по-сериозни здравoсловни ефекти.
            </ScaleDescription>
          </ScaleContent>
        </ScaleItem>

        <ScaleItem background="#ffcdd2">
          <FaceIcon color="#b71c1c">
            <span role="img" aria-label="very-unhealthy">😨</span>
          </FaceIcon>
          <ScaleContent>
            <strong>201+: Много нездравословно</strong>
            <ScaleDescription>
              Предупреждения за спешни състояния. Цялото население е вероятно да бъде засегнато. 
              Избягвайте всякакви дейности на открито.
            </ScaleDescription>
          </ScaleContent>
        </ScaleItem>
      </AQIScale>
    </DashboardContainer>
  );
};

export default Dashboard; 