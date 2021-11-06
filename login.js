const fetch = require("node-fetch")

async function test(){
  //const url = "https://netlifyauth.hyperbotauthor.repl.co/.netlify/functions/netlifyindex"
  const url = "https://mynetlifyauth.netlify.app/.netlify/functions/netlifyindex"  
  const password = process.env.PASSWORD
  console.log("logging in with", password)
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({password})
  })
  const blob = await response.json()
  if(blob.status === "ok"){    
    require('fs').writeFileSync("exports.sh", blob.exports)
    console.log("exports written")
  }else{
    console.log(blob.status)
  }  
}

test()