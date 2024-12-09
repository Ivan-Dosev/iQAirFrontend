import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Dashboard from './Dashboard';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 2rem;
`;

const App = () => {
  return (
    <AppContainer>
      <Dashboard />
    </AppContainer>
  );
};

export default App; 