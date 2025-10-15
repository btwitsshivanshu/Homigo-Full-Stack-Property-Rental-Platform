import React from 'react';
import Layout from '../layouts/Layout';

const ErrorPage = ({ message }) => {
  return (
    <Layout>
      <div className="row">
        <div className="alert alert-danger col-6 offset-3" role="alert">
          <h4 className="alert-heading">{message || 'An error occurred.'}</h4>
        </div>
      </div>
    </Layout>
  );
};

export default ErrorPage;
