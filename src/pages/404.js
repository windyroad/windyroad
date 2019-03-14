import PropTypes from 'prop-types';
import React from 'react';
import Layout from '../layouts/index';

const NotFoundPage = ({ location }) => (
  <Layout location={location}>
    <div
      style={{
        paddingTop: '4.5em',
      }}
    >
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist...</p>
    </div>
  </Layout>
);

NotFoundPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

export default NotFoundPage;
