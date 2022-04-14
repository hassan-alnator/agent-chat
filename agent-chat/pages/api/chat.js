// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'
const AssistantV1 = require('ibm-watson/assistant/v1');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
require('isomorphic-fetch');


const callPhone2 = async () => {
  const response = await fetch("https://us-south.functions.cloud.ibm.com/api/v1/namespaces/bbseirani@avertra.com_dev/actions/callNumber?blocking=true", {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    headers: {
      'Authorization': 'Basic NjM1YmUxZGUtODZlOS00NDNmLWIyZWYtYzMwMmRmMjk5MzA3Ok9PWkt3dmpEd3N3c2liQWJzbHU5UDVMM1I1MjVsZ0pMazdYQ2JTWnAwVzU1dWdyOGZlcHg2MEJYU2ZFR3c1ZVg='
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

const callPhone = () => {

  //return new Promise((resolve, reject) => {
    var url = "https://us-south.functions.cloud.ibm.com/api/v1/namespaces/bbseirani%40avertra.com_dev/actions/callNumber?blocking=true";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    // xhr.timeout = 15000;
    xhr.setRequestHeader("Authorization", "Basic NjM1YmUxZGUtODZlOS00NDNmLWIyZWYtYzMwMmRmMjk5MzA3Ok9PWkt3dmpEd3N3c2liQWJzbHU5UDVMM1I1MjVsZ0pMazdYQ2JTWnAwVzU1dWdyOGZlcHg2MEJYU2ZFR3c1ZVg=");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
        //resolve()
      }
    };

    xhr.send();

  //})
}

const API_KEY = '06yVeF4AtLNCWvoI3JaLekHCnZgEfoyYZoathGzB1J_1'//'nl4WrsWMrpRyGNKLfto9A5YB0vOGGhj6PlIXSCvDL58D';
// old v1
const SERVICE_URL = "https://api.us-south.assistant.watson.cloud.ibm.com/instances/43003d2d-10ab-4553-b354-96158c515e83";

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
})


const assistant = new AssistantV1({
  authenticator: new IamAuthenticator({ apikey: API_KEY }),
  serviceUrl: SERVICE_URL,
  version: '2020-04-01',
});

// const assistant = new AssistantV2({
//   authenticator: new IamAuthenticator({ apikey: API_KEY }),
//   serviceUrl: 'https://gateway.watsonplatform.net/assistant/api/',
//   version: '2018-09-19'
// });





async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  const {
    query: { text },
  } = req


  // const session = await assistant.createSession({
  //   assistantId: 'fc7a0497-057c-4b13-b772-bd31a2bd0509'
  // })

  //https://api.us-south.assistant.watson.cloud.ibm.com/instances/43003d2d-10ab-4553-b354-96158c515e83/v1/workspaces/74e81a16-a7c4-422a-b369-b611a63261f4/message

  // old v1
  const response = await assistant.message({
    workspaceId: '74e81a16-a7c4-422a-b369-b611a63261f4',//'21098e59-1fbf-4225-9cb2-a12dc1a6cec1',
    input: { text },
  });

  const { result } = response;
  //res.setHeader('Content-Type', 'application/text')
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200

  let responseText = result.output.generic[0].text;
  const makeCall = responseText === "Ok stand by while i transfer you to Erynn" ? true : false;

  if (makeCall) {
    try {
      console.log("makeCall",makeCall)
      //callPhone();
    } catch (e) {
      console.log(e)
    }
  }

  res.json({ text: responseText })

  // assistant.message(
  //   {
  //     input: { text },
  //     assistantId: 'fc7a0497-057c-4b13-b772-bd31a2bd0509',
  //     sessionId: session.result.session_id,
  //   })
  //   .then(response => {
  //     console.log(JSON.stringify(response.result, null, 2));
  //     res.setHeader('Content-Type', 'application/json')
  //     res.statusCode = 200
  //     res.json({ text: response.result.output.generic[0].text })
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });



}

export default handler;


