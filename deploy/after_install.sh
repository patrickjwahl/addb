#!/bin/sh
whoami
source ~/.bashrc
cd /home/ec2-user/addb
npm install
npm run build
pm2 reload server