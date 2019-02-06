import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies

const Template = function({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark;
  return (
    <div className="container">
      <header className="major">
        <h2>{frontmatter.title}</h2>
        <p>{frontmatter.date}</p>
      </header>
      {/* eslint-disable-next-line react/no-danger */}
      <section id="content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

Template.propTypes = {
  data: PropTypes.isRequired,
};

Template.defaultProps = {};

export default Template;

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`;
