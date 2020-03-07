# email-printer
Software to fetch, format, and print emails from a thermal printer.

# How to build



# Setup

Prep an sd card with: https://www.raspberrypi.org/downloads/raspbian/ (I used the lite version)
Allow ssh and wifi by [configuring the sd image|https://howchoo.com/g/ndy1zte2yjn/how-to-set-up-wifi-on-your-raspberry-pi-without-ethernet]

Install a bunch of things! These two guides got me there: 
https://learn.adafruit.com/pi-thermal-printer/raspberry-pi-software-setup
https://learn.adafruit.com/networked-thermal-printer-using-cups-and-raspberry-pi/connect-and-configure-printer

Setup the printer using CUPS: https://www.howtogeek.com/169679/how-to-add-a-printer-to-your-raspberry-pi-or-other-linux-computer/


# Google Auth

Setup a project, OAuth Client, etc. Here's a decent starting point:

https://googleapis.dev/nodejs/googleapis/latest/gmail/index.html#oauth2-client

Download your secrets to credentials/client_secret.json

# Commands for development

lpr -o fit-to-page [image]
(on pi, lp)

base64 --decode


# Deployment

scp -r ~/Projects/email-printer/ pi@raspberrypi.local:~/email-printer

crontab -e 
add a line:
*/10 * * * * ~/email-printer/checkandprint.sh