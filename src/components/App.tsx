import React from 'react';
import './App.scss';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './routes';

function App({ ...props }) {
  return (
    <div className="app">
      <Router>
        <Routes>
          {routes.map((each) => {
            const { Component, url } = each;
            return <Route path={url} key={url} element={<Component />} />;
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
