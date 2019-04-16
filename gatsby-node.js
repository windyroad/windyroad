// const fm = require('./front-matter')

// const fs = require(`fs-extra`)
const path = require('path');
const slugify = require('slugify');
// const { createFilePath } = require('gatsby-source-filesystem');
// exports.onCreatePage = async function({ page }) {
//   const { attributes: { layout } } = fm(
//     await fs.readFile(page.component, 'utf8'),
//   )
//   page.layout = 'index'
// }

async function createBlogPages(createPage, graphql) {
  const blogTemplate = path.resolve(`src/templates/blogTemplate.js`);

  const blogQuery = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              title
              date(formatString: "YYYY/MM/DD")
            }
            fileAbsolutePath
          }
        }
      }
    }
  `);
  if (blogQuery.errors) {
    return Promise.reject(blogQuery.errors);
  }

  blogQuery.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: createPageSlug(node),
      component: blogTemplate,
      context: {
        fileAbsolutePath: node.fileAbsolutePath,
      }, // additional data can be passed via context
    });
  });
  return Promise.resolve();
}

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;
  await createBlogPages(createPage, graphql);

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              sort: { order: DESC, fields: [frontmatter___date] }
              limit: 1000
            ) {
              edges {
                node {
                  fileAbsolutePath
                }
              }
            }
          }
        `,
      ).then(result => {
        if (result.errors) {
          console.log('RESULT', result);
          reject(result.errors);
        } else {
          // ...
          console.log('RESULT', result);
          // Create blog-list pages
          const posts = result.data.allMarkdownRemark.edges;
          const postsPerPage = 2;
          const numPages = Math.ceil(posts.length / postsPerPage);
          Array.from({ length: numPages }).forEach((_, i) => {
            createPage({
              path: i === 0 ? `/blogx` : `/blogx/${i + 1}`,
              component: path.resolve('./src/templates/blogListTemplate.js'),
              context: {
                limit: postsPerPage,
                skip: i * postsPerPage,
              },
            });
          });
        }
      }),
    );
  });
};

function createPageSlug(node) {
  const slug = slugify(node.frontmatter.title, {
    lower: true,
  });
  const dirAbsolutePath = path.dirname(node.fileAbsolutePath);
  const dirname = path.basename(dirAbsolutePath);
  if (dirname !== slug) {
    console.error('Incorrect article directory name');
    console.error(`Rename: ${dirAbsolutePath}`);
    console.error(`To: ${path.dirname(dirAbsolutePath)}/${slug}`);
    process.exit(1);
  }
  return `blog/${slug}`;
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const value = createPageSlug(node);
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
