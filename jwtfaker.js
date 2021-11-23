'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');


let privateKey  = fs.readFileSync('./private.key', 'utf8');
let publicKey  = fs.readFileSync('./public.key', 'utf8');

let tokenData = [
    {"secId": "1234567890", "lastName": "TESTER0", "firstName": "JOHN", "email": "john.tester0@va.gov", "samAccountName": "vhatst1234567890", "jti": "c1211760-a083-4088-a55f-e02691afe1c3"},
    {"secId": "1234567891", "lastName": "TESTER1", "firstName": "JANE", "email": "jane.tester1@va.gov", "samAccountName": "vhatst1234567891", "jti": "914a06e6-8478-48c5-8902-a580cca0efe7"},
    {"secId": "1234567892", "lastName": "TESTER2", "firstName": "ROBERT", "email": "robert.tester2@va.gov", "samAccountName": "vhatst1234567892", "jti": "00e290bb-af10-4025-bac0-8e6d7402588b"},
    {"secId": "1234567893", "lastName": "TESTER3", "firstName": "SANDRA", "email": "sandra.tester3@va.gov", "samAccountName": "vhatst1234567893", "jti": "fcfbba2d-cbb5-4e46-9980-dbd031c0ad0b"},
    {"secId": "1234567894", "lastName": "TESTER4", "firstName": "WILLIAM", "email": "william.tester4@va.gov", "samAccountName": "vhatst1234567894", "jti": "4996fbcc-313f-45e2-9c36-54046f34afea"},
    {"secId": "1234567895", "lastName": "TESTER5", "firstName": "JACK", "email": "jack.tester5@va.gov", "samAccountName": "vhatst1234567895", "jti": "36065034-2a47-422d-b6d1-58bd412347c2"},
    {"secId": "1234567896", "lastName": "TESTER6", "firstName": "JOSEPH", "email": "joseph.tester6@va.gov", "samAccountName": "vhatst1234567896", "jti": "1c5e3e4c-034d-4140-b4f7-d0045b8aff89"},
    {"secId": "1234567897", "lastName": "TESTER7", "firstName": "SOPHIA", "email": "sophia.tester7@va.gov", "samAccountName": "vhatst1234567897", "jti": "94736ec8-5581-4ffd-9a5c-6091922ce891"},
    {"secId": "1234567898", "lastName": "TESTER8", "firstName": "ISABELLA", "email": "isabella.tester8@va.gov", "samAccountName": "vhatst1234567898", "jti": "f472e3a1-30f2-4ace-822d-978722b49c2e"},
    {"secId": "1234567899", "lastName": "TESTER9", "firstName": "VIOLET", "email": "violet.tester9@va.gov", "samAccountName": "vhatst1234567899", "jti": "d9db5b36-4090-4b32-a0b1-20a0c7fddce7"}
]

let tokenTemplate = {
    "lastName": "",
    "authenticated": true,
    "authenticationAuthority": "gov.va.iam.ssoi.v1",
    "idType": "secid",
    "vamf.auth.resources": [
      "^.*(/)?staff/1013594511(/.*)?$",
      "^.*(/)?patient[s]?(/.*)?$",
      "^.*(/)?site[s]?/(dfn-)?983(/.*)?$",
      "^.*(/)?site[s]?/(dfn-)?983(/.*)?$"
    ],
    "version": 2.6,
    "vistaIds": [
      {
        "duz": "520881829",
        "siteId": "442",
        "siteName": "CHYSHR"
      },
      {
        "duz": "520824652",
        "siteId": "500",
        "siteName":"SHANE TEST"
      }
    ],
    "firstName": "",
    "staffDisclaimerAccepted": true,
    "attributes": {
      "compact": "false",
      "adUpn": "",
      "secid": "",
      "adSamAccountName": ""
    },
    "vamf.auth.roles": [
      "staff",
      "va",
      "hcp"
    ],
    "email": "",
    "jti": ""
};


module.exports = {
    createToken: function(idx){

        if (idx < 0 || idx > 9) idx = 0;
        let data = tokenData[idx];

        let token = tokenTemplate;

        token.attributes.secid = data.secId;
        token.lastName = data.lastName;
        token.firstName = data.firstName;
        token.email = data.email;
        token.attributes.adUpn = data.email;
        token.attributes.adSamAccountName = data.samAccountName;
	token.jti = data.jti;

  var signOptions = {
    issuer: "gov.va.vamf.userservice.v2",
    subject: data.secId.toString(),
    audience: "SSOI_APP_DEV",
    expiresIn: "12h",
    notBefore: "0m",
    algorithm: "RS512"
};

        var signed = jwt.sign(token, privateKey, signOptions); 
        //console.log(signed);
        return signed;
    }

}