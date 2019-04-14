import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import PostLink from '../components/post-link';
import Layout from '../layouts/index';

class BlogPage extends React.Component {
  constructor(props) {
    super(props);
    this.postsToShow =
      typeof window !== `undefined` && typeof window.postsToShow !== `undefined`
        ? window.postsToShow
        : 8;

    this.state = {
      showingMore: false,
      postsToShow: this.postsToShow,
    };

    console.log('constructor', this.state);
    this.handleScroll = () => {
      if (!this.ticking) {
        this.ticking = true;
        requestAnimationFrame(() => this.update());
      }
    };
  }

  componentDidMount() {
    window.addEventListener(`scroll`, this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener(`scroll`, this.handleScroll);

    // remember how many posts we are showing, so if they come back
    // then we are showing the right number of posts
    const { postsToShow } = this.state;
    window.postsToShow = postsToShow;
  }

  update() {
    const {
      data: {
        allMarkdownRemark: { edges },
      },
    } = this.props;
    const posts = edges;
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight);
    const percentToBottom = distanceToBottom / window.innerHeight;
    const { postsToShow } = this.state;
    if (percentToBottom < 1 && postsToShow < posts.length) {
      this.setState(prevState => {
        return { postsToShow: prevState.postsToShow + this.postsToShow };
      });
    }
    this.ticking = false;
  }

  render() {
    const {
      data: {
        allMarkdownRemark: { edges },
      },
    } = this.props;
    const { location } = this.props;
    const { postsToShow } = this.state;
    const posts = edges
      .slice(0, postsToShow)
      .filter(edge => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
      .map(edge => <PostLink key={edge.node.id} post={edge.node} />);
    return (
      <Layout location={location}>
        <main className="container">
          <div className="content blog">
            <h2>Blog</h2>
            {posts}
          </div>
          <div style={{ textAlign: 'center', marginBottom: '0.75em' }}>
            <a href="https://windyroad.com.au/articles/">Older Blog Posts</a>
          </div>
        </main>
      </Layout>
    );
  }
}

BlogPage.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.any.isRequired,
  }).isRequired,
  location: PropTypes.shape({}).isRequired,
};
export default BlogPage;

export const pageQuery = graphql`
  query BlogQuery {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          fields {
            slug
          }
          id
          excerpt(pruneLength: 250)
          frontmatter {
            date(formatString: "YYYY/MM/DD")
            title
            author
            image {
              childImageSharp {
                fixed(height: 135) {
                  width
                  height
                  src
                  srcSet
                }
              }
            }
          }
          fileAbsolutePath
        }
      }
    }
  }
`;

// ...GatsbyImageSharpFixed_withWebp
