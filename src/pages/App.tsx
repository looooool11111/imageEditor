import React from 'react';
import './App.scss';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { routes } from './routes';
import store from '../store';
function App({ ...props }) {
  return (
    <div className="app">
      <Provider store={store}>
        <Router>
          <Routes>
            {routes.map((each) => {
              const { Component, url } = each;
              return <Route path={url} key={url} element={<Component />} />;
            })}
          </Routes>
        </Router>
      </Provider>
    </div>
  );
}

export default App;
