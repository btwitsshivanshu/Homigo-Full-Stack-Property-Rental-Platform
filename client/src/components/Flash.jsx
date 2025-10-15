import React from 'react';

const Flash = ({ success, error }) => {
  return (
    <>
      <style>
        {`
          .flash-fixed {
            position: fixed;
            top: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1055;
            min-width: 320px;
            max-width: 500px;
            width: 50vw;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          }
        `}
      </style>
      {success && success.length > 0 && (
        <div className="alert alert-success alert-dismissible fade show flash-fixed" role="alert">
          {success}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}
      {error && error.length > 0 && (
        <div className="alert alert-danger alert-dismissible fade show flash-fixed" role="alert">
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}
    </>
  );
};

export default Flash;
