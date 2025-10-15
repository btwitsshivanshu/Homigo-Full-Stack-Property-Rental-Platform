import React from 'react';
import './Loader.css';

const Loader = ({ message }) => {
  return (
    <div className="loader-wrap" role="status" aria-live="polite" aria-busy="true">
      <div className="compass">
        <div className="compass-ring" />
        <div className="compass-center" />
        <div className="compass-needle" />
      </div>
      {message ? <div className="loader-msg">{message}</div> : null}
    </div>
  );
};

export default Loader;
