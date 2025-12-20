#!/bin/sh
source ~/.bashrc
cd /home/ec2-user/addb
sudo chown -R ec2-user:root .
npm install
npm run build
pm2 reload server