#!/bin/sh
cd /home/ec2-user/addb
npm install
npm run build
pm2 reload server