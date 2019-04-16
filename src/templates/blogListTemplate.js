import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import PostLink from '../components/post-link';
import Layout from '../layouts/index';

export default class BlogList extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { data } = this.props;
    this.posts = data.allMarkdownRemark.edges
      .filter(edge => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
      .map(edge => <PostLink key={edge.node.id} post={edge.node} />);
  }

  render() {
    const { location } = this.props;
    return (
      <Layout location={location}>
        <main className="container">
          <div className="content privacy">
            <h2>News</h2>
            {this.posts}
          </div>
        </main>
      </Layout>
    );
  }
}

BlogList.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.shape({
        title: PropTypes.string.isRequired,
        date: PropTypes.string,
        author: PropTypes.string,
        image: PropTypes.string,
      }).isRequired,
      html: PropTypes.any.isRequired,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({}).isRequired,
};

export const pageQuery = graphql`
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY/MM/DD")
            title
            author
            image {
              childImageSharp {
                fixed(width: 200) {
                  width
                  height
                  src
                  srcSet
                }
              }
            }
          }
        }
      }
    }
  }
`;
