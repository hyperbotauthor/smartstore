const parse = require('parse-git-config')
 
const parsed = parse.sync()

let url = null

const remoteOrigin = parsed[`remote "origin"`]

if(remoteOrigin){
  url = remoteOrigin.url
}

if(!url){
  console.log("no origin, falling back to origin.url")
  try{
    url = require('fs').readFileSync("origin.url").toString()
  }catch(err){
    console.error("ERROR no origin url")
    process.exit(1)
  }
}

const [prot, host, user, repo] = url.split(new RegExp("\/+"))

const email = `${user}@gmail.com`

const qualifiedUrl = `${prot}//${user}:${process.env["GIT_TOKEN"]}@${host}/${user}/${repo}`

const exportssh = `
export GIT_URL=${url}
export GIT_PUSH_URL=${qualifiedUrl}
export GIT_USER=${user}
export GIT_EMAIL=${email}`

require('fs').writeFileSync("exports.sh", exportssh)

console.log(exportssh)