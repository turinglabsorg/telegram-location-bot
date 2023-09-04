#!/bin/bash

echo "STARTING DEPENDENCIES"

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g

#SETTING UP NGINX AND FIREWALL
sudo apt update
sudo apt install nginx -y
sudo ufw allow 22
sudo ufw allow 'Nginx Full'
sudo ufw enable -y

#INSTALL CERTBOT
sudo add-apt-repository ppa:certbot/certbot -y
sudo apt update
sudo apt install python-certbot-nginx -y

npm install
