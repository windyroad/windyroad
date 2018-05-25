#!/bin/sh


DEPLOY_DOMAIN=$1
VERSION=$2
ASSET_URL=$3

echo $DEPLOY_DOMAIN
echo $VERSION
echo $ASSET_URL


mkdir domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM
cp -a domains/original.windyroad.com.au/. domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM/

mkdir domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM-extract
curl -X GET $ASSET_URL -H "Accept: application/octet-stream" --user "$GITHUB_TOKEN:" -L --silent \
 | tar -C domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM-extract -z -x -v -f -
cp -a domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM-extract/. domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM/html/

rm -rf domains/$DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM-extract

(cd domains && ln -sfvT $DEPLOY_DOMAIN-$VERSION-$CIRCLE_BUILD_NUM $DEPLOY_DOMAIN)
