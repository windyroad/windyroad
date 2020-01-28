---
date: '2020-01-29'
title: 'Script to wait untill Docker container is healthy'
author: 'Tom Howard'
tags: ['devops', 'software', 'docker', 'script']
---

Here's a quick script that can be used to wait until a Docker container reports the status is heathly (or not).

It assumes the image has <a href="https://docs.docker.com/engine/reference/builder/#healthcheck">HEALTHCHECK</a> configured

First arg is the container ID.

```
#!/bin/bash


while true
do
  STATUS=`docker inspect --format='{{json .State.Health.Status}}' $1`
  if [ "$STATUS" == '"healthy"' ] ; then
    echo "$(date -u) Healthy!!!"
    sleep 1
    exit 0
  elif [ "$STATUS" == '"unhealthy"' ] ; then
    echo "$(date -u) Unhealthy!!!"
    sleep 1
    exit 9
  elif [ "$STATUS" == '"starting"' ] ; then
    echo "$(date -u) starting!!!"
  else
    echo "Huh? $STATUS"
    sleep 1
    exit 10
  fi
  sleep 1
done
```
