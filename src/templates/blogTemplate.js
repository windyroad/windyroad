import { DiscussionEmbed } from 'disqus-react';
import { graphql, Link } from 'gatsby';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Layout from '../layouts/index';

const BlogTemplate = function Template({ data, location }) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { frontmatter, html, fields, id } = markdownRemark;
  const more = frontmatter.link ? (
    <OutboundLink href={frontmatter.link} target="_blank">
      read more...
    </OutboundLink>
  ) : (
    ''
  );
  // const img = frontmatter.image ? (
  //   <div>
  //     <Img fluid={frontmatter.image.childImageSharp.fluid} />
  //     {/* <img
  //       style={{ float: 'left' }}
  //       src={frontmatter.image.childImageSharp.fixed.src}
  //       srcSet={frontmatter.image.childImageSharp.fixed.srcSet}
  //       alt={frontmatter.imageAlt}
  //     /> */}
  //   </div>
  // ) : (
  //   ''
  // );

  const disqusShortname = 'windy-road';
  const disqusConfig = {
    identifier: id,
    title: frontmatter.title,
  };

  return (
    <Layout location={location}>
      <main className="container">
        <article className="content blog-article">
          {/* {img} */}
          <header>
            <h2>
              <Link to={fields.slug}>{frontmatter.title}</Link>
            </h2>
            <div className="meta">
              by {frontmatter.author},{' '}
              {moment(frontmatter.date, 'YYYY/MM/DD').format('MMMM YYYY')}
              <div>
                {frontmatter.tags.map(tag => {
                  return <span>#{tag} </span>;
                })}
              </div>
            </div>
          </header>
          <section className="blog-article-content">
            <div
              className="blog-article-content"
              dangerouslySetInnerHTML={{ __html: html }} // eslint-disable-line react/no-danger
            />
            {more}
          </section>
          <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
        </article>
      </main>
    </Layout>
  );
};

BlogTemplate.propTypes = {
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

export default BlogTemplate;

export const pageQuery = graphql`
  query NewsArticelByPath($fileAbsolutePath: String!) {
    markdownRemark(fileAbsolutePath: { eq: $fileAbsolutePath }) {
      html
      fields {
        slug
      }
      frontmatter {
        date(formatString: "YYYY/MM/DD")
        title
        author
        tags
        image {
          childImageSharp {
            fluid(maxWidth: 1168) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
      fileAbsolutePath
    }
  }
`;

// ...GatsbyImageSharpFixed_withWebp
