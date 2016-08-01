## Pre-requisites
* [Git](http://www.git-scm.org)
* [NodeJS](http://www.nodejs.org)
* NPM modules:  
	* Gulp cli (npm i gulp -g)
	* Bower (npm i bower -g)
	* Typings (npm i typings -g)

## Quick Start
1. Run "npm i" to install development dependencies
2. Run "gulp" to build out all files for the first time and start up the server which watches your files for changes. Additional commands are available for specific tasks, see gulpfile.js

## Useful tools
### Social
* Social Meta Tags http://moz.com/blog/meta-data-templates-123
* Twitter Validation Tool https://dev.twitter.com/docs/cards/validation/validator
* Facebook Debugger https://developers.facebook.com/tools/debug
* Google Structured Data Testing Tool http://www.google.com/webmasters/tools/richsnippets
* Pinterest Rich Pins Validator http://developers.pinterest.com/rich_pins/validator/

## Useful tips

### If you're on Mac...
* If you experience issues with Node permissions, run:

		sudo chown -R `whoami` ~/.npm

		sudo chown -R `whoami` /usr/local/lib/node_modules

### If you're on Ubuntu...
* Follow Mac instructions but also keep these two issues in mind:
	* 	http://stackoverflow.com/questions/18130164/nodejs-vs-node-on-ubuntu-12-04

### If you're on Windows...
* Install Git and Node to your PATH