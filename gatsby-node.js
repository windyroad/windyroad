// const fm = require('./front-matter')

// const fs = require(`fs-extra`)
const path = require('path');

// exports.onCreatePage = async function({ page }) {
//   const { attributes: { layout } } = fm(
//     await fs.readFile(page.component, 'utf8'),
//   )
//   page.layout = 'index'
// }

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blogTemplate.js`);

  return graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.path,
        component: blogPostTemplate,
        context: {}, // additional data can be passed via context
      });
    });
    return Promise.resolve();
  });
};
