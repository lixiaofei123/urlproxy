import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import DomainValidator from './domain-validator.js';

const __dirname = path.resolve();
const app = express();
app.use(express.json()) 
app.use(cookieParser());

app.use("/*", (req, resp, next) => {
    const baseUrl = req.baseUrl;
    if(baseUrl !== "" && baseUrl !== "/" && baseUrl !== "/auth/login"){
        if(PASSWORD !== ""){
            const authentication = req.cookies["Authentication"] || req.headers["authorization"]  || ""
            if(authentication !== ""){
                if(authentication.indexOf("Basic") === 0){
                    const encodedstr = authentication.substring(6)
                    const decodedstr = Buffer.from(encodedstr, 'base64').toString('ascii');
                    const userpass = decodedstr.split(":")
                    if(userpass.length === 2){
                        const password = userpass[1]
                        if(password === PASSWORD){
                            next()
                        }else{
                            resp.status(401).send("wrong password")
                        }
                    }else{
                        resp.status(400).send("unknown authorization type")
                    }
                }else if (authentication.indexOf("Bearer") === 0){
                    let jwttoken =  authentication.substring(7)
                    jwt.verify(jwttoken,SIGN_KEY,(err, _decoded)=>{
                        if(err){
                            resp.status(401).send(err.toString())
                        }else{
                            next()
                        }
                    })
                }else{
                    resp.status(400).send("unknown authorization type")
                }
                
            }else{
                resp.status(401).send("authorization is empty")
            }
        }else{
            next()
        }
    }else{
        next()
    }
    
  })

app.get("/proxy/*", async (req, resp) => {
    
    const proxypath = req.url.substring(7);
    try {
        const proxyurl = new URL(proxypath)
        const proxyhost = proxyurl.hostname
        const reqhost =  req.hostname

        if(reqhost === "" || reqhost === proxyhost){
            throw new Error("url is not allowed")
        }

        if(ALLOWED_DOMAINS !== "" && !DOMAIN_VALIDATOR.match(proxyhost)){
            throw new Error("domain is not allowed")
        }
        
        let headers = req.headers
        headers["host"] = proxyhost
        headers["accept-encoding"] = undefined

        const proxyResp = await fetch(proxypath, {
            headers: headers,
            redirect: "manual"
        });

        if(proxyResp.status === 200){

            let proxyRespHeaders = proxyResp.headers;
            proxyRespHeaders.delete("content-security-policy");
            proxyRespHeaders.delete("content-security-policy-report-only");
            proxyRespHeaders.delete("clear-site-data");
            proxyRespHeaders.delete("content-encoding")
            proxyRespHeaders.set("access-control-expose-headers", "*");
            proxyRespHeaders.set("access-control-allow-origin", "*");
            if(!proxyRespHeaders.has("content-disposition")){
                if(FORCE_DOWNLOAD !== "false"){
                    proxyRespHeaders.set("content-disposition", "attachment");
                }
            }
            
            for (const [key, value] of proxyRespHeaders.entries()) {
                resp.set(key, value);
            }
            proxyResp.body.pipe(resp);

        }else if(proxyResp.status === 301 || proxyResp.status === 302){
            let proxyRespHeaders = proxyResp.headers;
            const location = proxyRespHeaders.get("location")
            resp.set("Location", "/proxy/" + location)
            resp.status(proxyResp.status).send("")

        }else{
            proxyResp.body.pipe(resp);
        }   

       
    } catch (error) {
        resp.status(400).send(error.toString());
    }
})



app.get("/", async (_req, resp) => {
    resp.sendFile(path.resolve(__dirname,"index.html"));
})

app.post("/auth/check", async (req, resp) => {
    resp.status(200).send("")
})

app.post("/auth/login", async(req, resp) => {
    if(PASSWORD !== ""){
        try{
            const bodyjson = req.body;
            const pwd = bodyjson["password"]
            if(pwd === PASSWORD){
                const authentication = jwt.sign({ foo: 'bar', iat: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }, SIGN_KEY);
                resp.status(200).json({
                    authentication: authentication
                })
            }else{
                resp.status(401).send("密码错误")
            }
        }catch(err){
            resp.status(400).send(err.toString())
        }
       
    }else{
        resp.status(200).json({})
    }
})

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD || "";
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS || ""
const FORCE_DOWNLOAD = (process.env.FORCE_DOWNLOAD || "").toLowerCase()
let DOMAIN_VALIDATOR = undefined
if(ALLOWED_DOMAINS !== ""){
    let domains = ALLOWED_DOMAINS.split(",")
    DOMAIN_VALIDATOR = new DomainValidator(domains)  
}
const SIGN_KEY = uuidv4();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

