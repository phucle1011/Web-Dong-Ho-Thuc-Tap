import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from 'react-cookie'; // 👈 Thêm dòng này

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CookiesProvider> {/* 👈 Bọc App ở đây */}
      <App />
    </CookiesProvider>
  </React.StrictMode>
);

reportWebVitals();
