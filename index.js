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

app.get('/test', (request, response) => {
  
    
      response.send("PHNhbWxwOlJlc3BvbnNlIElEPSJfNGVlOWI0ZGQtZDg0MC00NDZkLTk3OWEtNmE2OWIxYmUzNGYyIiBWZXJzaW9uPSIyLjAiIElzc3VlSW5zdGFudD0iMjAyMS0xMi0xNVQyMToyODoxNy4zNDNaIiBEZXN0aW5hdGlvbj0iaHR0cHM6Ly9zaWduaW4uYW1hem9uYXdzLXVzLWdvdi5jb20vc2FtbCIgQ29uc2VudD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmNvbnNlbnQ6dW5zcGVjaWZpZWQiIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiPjxJc3N1ZXIgeG1sbnM9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iPmh0dHA6Ly9wcm9kLmFkZnMuZmVkZXJhdGlvbi52YS5nb3YvYWRmcy9zZXJ2aWNlcy90cnVzdDwvSXNzdWVyPjxzYW1scDpTdGF0dXM+PHNhbWxwOlN0YXR1c0NvZGUgVmFsdWU9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpzdGF0dXM6U3VjY2VzcyIgLz48L3NhbWxwOlN0YXR1cz48QXNzZXJ0aW9uIElEPSJfNjM2OGY1YTMtY2U5OC00MDM3LWI4OTItMDcwZmUyYTI0M2Q5IiBJc3N1ZUluc3RhbnQ9IjIwMjEtMTItMTVUMjE6Mjg6MTcuMzQzWiIgVmVyc2lvbj0iMi4wIiB4bWxucz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI+PElzc3Vlcj5odHRwOi8vcHJvZC5hZGZzLmZlZGVyYXRpb24udmEuZ292L2FkZnMvc2VydmljZXMvdHJ1c3Q8L0lzc3Vlcj48ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIj48ZHM6U2lnbmVkSW5mbz48ZHM6Q2Fub25pY2FsaXphdGlvbk1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIgLz48ZHM6U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjcnNhLXNoYTI1NiIgLz48ZHM6UmVmZXJlbmNlIFVSST0iI182MzY4ZjVhMy1jZTk4LTQwMzctYjg5Mi0wNzBmZTJhMjQzZDkiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjZW52ZWxvcGVkLXNpZ25hdHVyZSIgLz48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIiAvPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2IiAvPjxkczpEaWdlc3RWYWx1ZT4vRVlvZGp3VDZCQndWNTN0bnUzSVBYdmVISWUyemRXWEl0VUtLcU91Z0JnPTwvZHM6RGlnZXN0VmFsdWU+PC9kczpSZWZlcmVuY2U+PC9kczpTaWduZWRJbmZvPjxkczpTaWduYXR1cmVWYWx1ZT5BTFZJbjhTVlNFMnZoek1IVm14RHFvbDhBSlpMWnBpc1E3R0dkdDBYMDBkd1VCUU9BenRWaUl1UHV4WU03NE92R2laT3BqY0t0MUQ5bEduRFFYTkJ3VmFUcVNCTWc4WlljUFRpY1lrODNTYVNIZ3JKalBNb1pGSkU3NDBES0RQYVU5RDcyUnpLZXdhV20rcXZEVnBWZVVBQVFicE9WQ2FEOThrZ095Yk9LUGlaMzIxY1EzeExWVCt3emZDK25WU203UU10dFRudG1tRnFzN2JpNTlRWVRGamVNc28zYkRIVFkvc3ZpeVJqN200NHA3Z01Qa3drTHQ4M1hSRHhwb0s4dG1COC9CN3p5bWh5aGJsYkZEQ0t2YzY4bmdsSkE1VWZjd1hnMUdhMTFvOEhSL2pFc053ZHFSOUhQOWNZWDlDa1ZiRDNScC9GTU1rYXYyRzFUODdtQmc9PTwvZHM6U2lnbmF0dXJlVmFsdWU+PEtleUluZm8geG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUM4akNDQWRxZ0F3SUJBZ0lRSDR6c2tWTVNTSXRESGNjbDZ2Q3pvekFOQmdrcWhraUc5dzBCQVFzRkFEQTFNVE13TVFZRFZRUURFeXBCUkVaVElGTnBaMjVwYm1jZ0xTQndjbTlrTG1Ga1puTXVabVZrWlhKaGRHbHZiaTUyWVM1bmIzWXdIaGNOTVRjeE1ESTBNVGt6TVRNNFdoY05NamN4TURJeU1Ua3pNVE00V2pBMU1UTXdNUVlEVlFRREV5cEJSRVpUSUZOcFoyNXBibWNnTFNCd2NtOWtMbUZrWm5NdVptVmtaWEpoZEdsdmJpNTJZUzVuYjNZd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURDZ0ZwcVVOVExZNmd1bG5YcEZJSFN1bzlyOG52cENPVjhBdlJuNkRQUHNPWlVJYmo0c1VhZ2tpVkoreFlFT0FpTS9ac1dxWUxYTFJyYk9oOG45eGEyOUtmOGNiZndxR0lHZFBnQVI2L2hSTDRidnQyTTBaV3p0aU0wemxSZ0JkazY1c3lUL2wrd2lmWGF4TVR2blEyNjdqNXdDYlkwZFNDWjhXZXNEalB6UTlNd0NMdmJjQzVsU2VzWVlYckw1dllEeDBuenRwT3lJRDB4Y0sxemQvTHhQcXViL2NFbWhZMnZlMXpISHFVblR3eG9KL1huamE2THJQZmx5UkJFYi9CRGtRNlpYL3NiUENFUmFVV3ptOHk0ZFJYdk43blhMR3RiV1RiSkFKSVlxUTdsd0E3T1hBeG9lTVo3a1J1VTRhaHVkL0FyajhmaHhJMnpMbkhuTERxckFnTUJBQUV3RFFZSktvWklodmNOQVFFTEJRQURnZ0VCQUcvaE5ybURxZ0VoWjhBY3pxdkh3aW91a3N1RUJxcXByOHRLMnEzRDk3ZkpOQmluWnB3SERKZWZma3grOVBiWnpvYU1rQ01ER3ZYck0zQUhyT09HU3l6dnVsQXdHc1FBbnZaM3B1WHdrYVMrOUNVVWJCTUs0S1FuTEpIbExFSC9rNkx1bkliMkZNUUJoT2hkYlJXb1ljcmMxdTYxbGpaMEJLV1JOWHBmN0lMZlZJbzBTQ3JFb0FrZU9RQWRPbVRWcE8reEtPVk1jbXRRY3NWVzBpSmRKaTV4dGdJa0V2cVhKVDhySjBaalkvZEVZaUtMdUNoWDUvQnd6dFlkZWZFcVlyNHAxOGl4M0daOTRYU1ZUWVFjZ0RpS0dmY3FwdmlURW15RGtQRXdzbFVoQlQwQzlaZ1hITTFkTGYra2pjcndwcTh5ckEyMndOcHJabUdqUkQ5SkIvbz08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvS2V5SW5mbz48L2RzOlNpZ25hdHVyZT48U3ViamVjdD48TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCI+RFZBXFZBQ09FbGxpb1MxPC9OYW1lSUQ+PFN1YmplY3RDb25maXJtYXRpb24gTWV0aG9kPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6Y206YmVhcmVyIj48U3ViamVjdENvbmZpcm1hdGlvbkRhdGEgTm90T25PckFmdGVyPSIyMDIxLTEyLTE1VDIxOjMzOjE3LjM0M1oiIFJlY2lwaWVudD0iaHR0cHM6Ly9zaWduaW4uYW1hem9uYXdzLXVzLWdvdi5jb20vc2FtbCIgLz48L1N1YmplY3RDb25maXJtYXRpb24+PC9TdWJqZWN0PjxDb25kaXRpb25zIE5vdEJlZm9yZT0iMjAyMS0xMi0xNVQyMToyODoxNy4xNzFaIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMTItMTVUMjI6Mjg6MTcuMTcxWiI+PEF1ZGllbmNlUmVzdHJpY3Rpb24+PEF1ZGllbmNlPmh0dHBzOi8vc2lnbmluLmFtYXpvbmF3cy11cy1nb3YuY29tL3NhbWw8L0F1ZGllbmNlPjwvQXVkaWVuY2VSZXN0cmljdGlvbj48L0NvbmRpdGlvbnM+PEF0dHJpYnV0ZVN0YXRlbWVudD48QXR0cmlidXRlIE5hbWU9Imh0dHBzOi8vYXdzLmFtYXpvbi5jb20vU0FNTC9BdHRyaWJ1dGVzL1JvbGVTZXNzaW9uTmFtZSI+PEF0dHJpYnV0ZVZhbHVlPnNoYW5lLmVsbGlvdHRAdmEuZ292PC9BdHRyaWJ1dGVWYWx1ZT48L0F0dHJpYnV0ZT48QXR0cmlidXRlIE5hbWU9Imh0dHBzOi8vYXdzLmFtYXpvbi5jb20vU0FNTC9BdHRyaWJ1dGVzL1JvbGUiPjxBdHRyaWJ1dGVWYWx1ZT5hcm46YXdzLXVzLWdvdjppYW06OjAxNjEzNDk4MzU0MzpzYW1sLXByb3ZpZGVyL0FERlMsYXJuOmF3cy11cy1nb3Y6aWFtOjowMTYxMzQ5ODM1NDM6cm9sZS9hZGZzLXByb2plY3QtYWRtaW5pc3RyYXRvcnM8L0F0dHJpYnV0ZVZhbHVlPjxBdHRyaWJ1dGVWYWx1ZT5hcm46YXdzLXVzLWdvdjppYW06OjE3MTg3NTYxNzM0NzpzYW1sLXByb3ZpZGVyL0FERlMsYXJuOmF3cy11cy1nb3Y6aWFtOjoxNzE4NzU2MTczNDc6cm9sZS9hZGZzLXByb2plY3QtYWRtaW5pc3RyYXRvcnM8L0F0dHJpYnV0ZVZhbHVlPjxBdHRyaWJ1dGVWYWx1ZT5hcm46YXdzLXVzLWdvdjppYW06OjQzMjg5Njc1MDUxMzpzYW1sLXByb3ZpZGVyL0FERlMsYXJuOmF3cy11cy1nb3Y6aWFtOjo0MzI4OTY3NTA1MTM6cm9sZS9hZGZzLXByb2plY3QtYWRtaW5pc3RyYXRvcnM8L0F0dHJpYnV0ZVZhbHVlPjwvQXR0cmlidXRlPjxBdHRyaWJ1dGUgTmFtZT0iaHR0cHM6Ly9hd3MuYW1hem9uLmNvbS9TQU1ML0F0dHJpYnV0ZXMvU2Vzc2lvbkR1cmF0aW9uIj48QXR0cmlidXRlVmFsdWU+Mjg4MDA8L0F0dHJpYnV0ZVZhbHVlPjwvQXR0cmlidXRlPjwvQXR0cmlidXRlU3RhdGVtZW50PjxBdXRoblN0YXRlbWVudCBBdXRobkluc3RhbnQ9IjIwMjEtMTItMTVUMTU6NTE6NTAuOTYxWiIgU2Vzc2lvbkluZGV4PSJfNjM2OGY1YTMtY2U5OC00MDM3LWI4OTItMDcwZmUyYTI0M2Q5Ij48QXV0aG5Db250ZXh0PjxBdXRobkNvbnRleHRDbGFzc1JlZj51cm46ZmVkZXJhdGlvbjphdXRoZW50aWNhdGlvbjp3aW5kb3dzPC9BdXRobkNvbnRleHRDbGFzc1JlZj48L0F1dGhuQ29udGV4dD48L0F1dGhuU3RhdGVtZW50PjwvQXNzZXJ0aW9uPjwvc2FtbHA6UmVzcG9uc2U+")
    
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

