import { Link, navigate } from 'gatsby';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import './_post-link.scss';

class PostLink extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { post } = this.props;
    navigate(post.fields.slug);
  }

  render() {
    const { post } = this.props;
    // const img = post.frontmatter.image ? (
    //   <img
    //     style={{ float: 'right', marginLeft: '0.75em' }}
    //     src={post.frontmatter.image.childImageSharp.fixed.src}
    //     srcSet={post.frontmatter.image.childImageSharp.fixed.srcSet}
    //     alt={post.frontmatter.imageAlt}
    //   />
    // ) : (
    //   ''
    // );
    const height = post.frontmatter.image
      ? `${post.frontmatter.image.childImageSharp.fixed.height + 1}px`
      : '135px';
    return (
      <article
        className="post-link"
        style={{
          minHeight: height,
          overflow: 'auto',
        }}
        onClick={this.onClick}
        onKeyPress={this.onClick}
        role="presentation"
      >
        {/* {img} */}
        <div style={{ marginLeft: '0.75em', marginRight: '0.75em' }}>
          <header>
            <h3>
              <Link to={post.fields.slug}>{post.frontmatter.title}</Link>
            </h3>
          </header>
          <div className="meta">
            By {post.frontmatter.author},{' '}
            {moment(post.frontmatter.date, 'YYYY/MM/DD').format('MMMM YYYY')}
          </div>
          <section>
            {post.excerpt} <Link to={post.fields.slug}>(more)</Link>
          </section>
        </div>
      </article>
    );
  }
}

PostLink.propTypes = {
  post: PropTypes.shape({
    frontmatter: PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.string,
      author: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
export default PostLink;
