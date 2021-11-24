'use strict';

const http = require('http'),
{ exec } = require('child_process');
const path = require('path');
const got = require('got');
const express = require('express');
const jwtfaker = require('./jwtfaker');
const config = require('./env.js');

const bodyParser = require('body-parser');
const { env } = require('process');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Create Express webapp
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Functions
// here for reference
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.header('Access-Control-Allow-Credentials', 'true')
        next();
});

//routes
app.get('/token/:idx', (request, response) => {
    //token faker stolen from Andy (https://github.com/department-of-veterans-affairs/octo-ssoi-jwt-dev)
    if(config.env=='dev'){
        let idx = request.params.idx;
        idx = isNaN(idx) ? 0 : idx;
        let token = jwtfaker.createToken(idx);
        return  response.send(JSON.stringify({'token':token}));
    }else
    exec('sts-token-generator.exe --env ' + config.env, (err, stdout, stderr) => {

        var token=JSON.parse(stdout)
        var payload={}
        payload=token
        if (err) {
          return response.send(JSON.stringify(err));
        }
 
        return  response.send(JSON.stringify(payload));
    });


});

app.get('/vistaData', (request, response) => {
   got.post('https://staging.api.vetext.va.gov/vista-api/api/auth/token',
    {json:{
      "key":config.key,
      "stationNo": "500",
      "duz": "520824652"
    }
    }).then(function(data){
        got.post('https://staging.api.vetext.va.gov/vista-api/api/v1/xrpc/xcte',
        {headers:{'authorization':'Bearer '+JSON.parse(data.body).payload.token},
        json:{
          "context" : "SDECRPC",
          "rpc" : "SDEC RESCE",
          "jsonResult" : "FALSE",
          "parameters" : [""]
        }}).then(function(data){
           var jsonData = JSON.parse(data.body);
          var resp = jsonData.payload
          if (resp){
          var respArr = resp.split(String.fromCharCode(30));
          var header = respArr[0].split("^");
          header = header.map(element=>element.substr(6))
          respArr.shift()
          var dataArr =[]
          respArr.forEach(function(e){
              var rec = e.split("^")
              dataArr.push(rec)
          })
          var list = []
          dataArr.forEach(function(e,i){
              var rec ={}
              e.forEach(function(c,f){
                rec[header[f]]=c
              })
              list.push(rec)
          })
            response.send(list)
          }
        })
    }).catch(function (error) {
      console.log(error);
  });
});


app.get('/soap', (request, response) => {
  //start of getting SAML token need to re-visit. 
    var soapRequest = "";

    soapRequest += "<soap:Envelope xmlns:ns1=\"http://docs.oasis-open.org/ws-sx/ws-trust/200512\" xmlns:wss=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:wsa=\"http://schemas.xmlsoap.org/ws/2004/08/addressing\" xmlns:wsp=\"http://schemas.xmlsoap.org/ws/2004/09/policy\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><soap:Header/> ";
    soapRequest += "  <soap:Body>   ";
    soapRequest += "      <ns1:RequestSecurityToken> ";
    soapRequest += "       <ns1:OnBehalfOf> ";
    soapRequest += "          <ns1:Base> ";
    soapRequest += "              <wss:BinarySecurityToken EncodingType=\"base64\" ValueType=\"http://ssoi.sts.va.gov/siteminder/std_token\">neHh92fLpxuGSL+nj32Nh78B75z/dZ50jj/iArOfzttKWNwG6Z2P6TzaIF0ADBaWWRruxq9jV8r95rsuijtSD1nXT51cFM9d8GsnbW+S94hpcbCNWP5vRckfr0BuvAgjqYAqNPOlMyQ+sOu7LGcAOjDQLuvVvvAwnr3juxzpmkFgsydaECOJRCg/QxvMsjC80naKHkJchJeIJzz86k/5Tl7/lPBdGxDRghRbJTMxUMwRotNYEw5Y4XarRMPb6kFiTWNI4Mfo495z7r998z9WoTIxH7ZclslcEeQlbolv9k3zmv+7Ku6e3L6SWf8YzEpi0ZIHrVGyGnTxj8vPy7odkOHrlU10d2Vj4Ynhk9audXtUgxpQCvlfyZMmVkiQWvcZlNVvDRsJKjhCx6oNAdeQBLXWZBtMkDCrnDtRxPypDQe93WMVvNUpS4FsfpHPhcZc6PL9zQM9MPok8KCah8JKxAERbaTrCQqP6c+1JbxjvwG5kIBX46N6NchiA5DfDpJlm0cof3UsgG9SE485jHiCTs0E8kBT4LYiuorTKbMdoEpRqplPmUweH3OVeFLwF2d/HzLZ5Df6VVds5ABYUv6M7PUzvmfT/+Eb8+BphKxFBxvwOXZ3R6tK9qQKio/DJ8mNaDIlLxEtJUFq0GkS4SKxaIBvGGTRW0OSjQuSMxGtXzLBUaIih64YZu7M2z+IoTTtgFmVGQLZ6VknwV8T5iZIbwigU7IQLDWYpFDVmgulWCHPweX4awhjGSwZTDlX9jzzoz+QN2cUOc95HN82goUoCeyU9Kimv/3J3Mp9KyAVjqMiSPzpR9pVipEkttJo/wxkjrYhQ6gSEMuR0WZANgB2OvNomji3VVpSW/Zu+mqqJhd7JFCPEl4PSyKCiZt6ZxDrqEGmltN1t5gMkzXrx97XKFZMJvbJmv35e6ekaBEkXUvfm/1iaDj7sOlkjb+FwHIS5CkBBXBLBf/jdhXb8vcpiNbdaw55i7w4F31eoHa48+TvWelmivV/iTyhvXT7GoDrU6TjBlUNfeb8Y8J3bQhjTknFI6RpvtczbmaLypHC7/ub5MYOwGstvN9OZv/u9HTHDIRrTNhCW3uHLFu+hqd3k3zqG7Gf+Xc7gdBy/b1sl1s97oUtu5uDx/LsIjSskHXi/AmOIK3m0EV4AqsoylSCBrBlnOgnEhEJiDl8WPXWvNHvaq9an7koWMO+dvcfjY6biVVKEe6ecager6Uh+KqHH9Qo4LunTTfkwxYgXdHNgzvlLcMY06V6xqios1BvOKHj</wss:BinarySecurityToken> ";
    soapRequest += "          </ns1:Base> ";
    soapRequest += "       </ns1:OnBehalfOf> ";
    soapRequest += "          <wsp:AppliesTo> ";
    soapRequest += "              <wsa:EndpointReference> ";
    soapRequest += "                  <wsa:Address>https://ppd.ehmp.va.gov</wsa:Address> ";
    soapRequest += "              </wsa:EndpointReference> ";
    soapRequest += "          </wsp:AppliesTo> ";
    soapRequest += "          <ns1:Issuer> ";
    soapRequest += "              <wsa:Address>https://ssoi.sts.va.gov/Issuer/smtoken/SAML2</wsa:Address> ";
    soapRequest += "          </ns1:Issuer> ";
    soapRequest += "          <ns1:RequestType>http://schemas.xmlsoap.org/ws/2005/02/trust/Issue</ns1:RequestType> ";
    soapRequest += "          <ns1:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV2.0</ns1:TokenType> ";
    soapRequest += "      </ns1:RequestSecurityToken>   ";
    soapRequest += "  </soap:Body> ";
    soapRequest += "</soap:Envelope> ";
console.log(soapRequest)
response.send(soapRequest)
const options = {
    hostname: 'https://services.eauth.va.gov',
    port: 9301,
    path: '/STS/RequestSecurityToken',
    method: 'POST'
  }
  
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
  
    res.on('data', d => {
      process.stdout.write(d)
    })
  })
})


app.get('/lists', (request, response) => {
  let token = jwtfaker.createToken(0);
   got('https://staging.api.vetext.va.gov/vsecs-api/api/v1_0_0/pcl/lists',
    {
      headers:{'authorization':'Bearer '+token}
    }).then(function(data){
    
      response.send(data.body)
    }).catch(function (error) {
     console.log(error);
  });
})

app.get('/steps', (request, response) => {
  let token = jwtfaker.createToken(0);
   got('https://dev.vse-wf-api.va.gov/api/v1/workflows',
    {
      headers:{'authorization':'Bearer '+token}
    }).then(function(data){
    
      response.send(data.body)
    }).catch(function (error) {
      console.log(error);
  });
})

app.get('/list', (request, response) => {
  let token = jwtfaker.createToken(0);
  let url='https://dev.vse-wf-api.va.gov/api/v1/vista-sites/500/users/520824652/appointments?clinic_list_id='+request.query.listId
  got(url,
    {
      headers:{'authorization':'Bearer '+token}
    }).then(function(data){
      response.send(data.body)
    }).catch(function (error) {
      console.log(error);
  });
})


var server = http.createServer(app);
var port = process.env.PORT || 4567;
server.listen(port, () => {
  console.log('Express server running on *:' + port);
  console.log('using '+config.env+ ' env')
});

