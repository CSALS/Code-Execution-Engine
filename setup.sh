#!/bin/bash
# A bash script to install docker and clone the project repo. 
# Run sudo su before running this script
# One time Execute 

set -e

apt update 
apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" 
apt update
apt-cache policy docker-ce
apt install docker-ce

npm install
npm i pm2

pm2 start app.js
