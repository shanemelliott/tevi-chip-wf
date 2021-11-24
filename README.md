# Workflow Testing App


## Intro:

This is a quick and dirty web app in HTML and JQuery to enable testing of CHIP Workflow endpoints sfor the VSE Clinican facing Web app. 

It uses Andy's jwt faker for dev and Andy's ssoi jwt processor for production.  

All should work except the following on the todo list. 

- Get full list of clinics for editing groups will not work unless you have access to the all RPC endpoint.  Thsi will be fixed when CHIP exposes a new endpoint for this. 

- Creating New Groups

- Changing Users

- Changing Stations to 442 (chy16)


## Install:

1. clone
2. cd to directory
3. npm i
4. node .

Go to http://localhost:4567