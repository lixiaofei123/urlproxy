import express from 'express';
import fetch from 'node-fetch';
import path from 'path';


const __dirname = path.resolve();
const app = express();

app.get('/proxy/*', async (req, resp) => {
    
    const proxypath = req.url.substring(7); // Remove the leading '/'
    try {
        const proxyurl = new URL(proxypath)
        const proxyhost = proxyurl.hostname
        const reqhost =  req.hostname

        if(reqhost == "" || reqhost === proxyhost){
            throw new Error('url is not allowed')
        }

        const proxyResp = await fetch(proxypath);
        let proxyRespHeaders = proxyResp.headers;
        proxyRespHeaders.delete("content-security-policy");
        proxyRespHeaders.delete("content-security-policy-report-only");
        proxyRespHeaders.delete("clear-site-data");
        proxyRespHeaders.set("access-control-expose-headers", "*");
        proxyRespHeaders.set("access-control-allow-origin", "*");
        proxyRespHeaders.set("content-disposition", "attachment");
        for (const [key, value] of proxyRespHeaders.entries()) {
            resp.set(key, value);
        }
        proxyResp.body.pipe(resp);
    } catch (error) {
        resp.status(400)
        resp.send(error.toString());
    }
})



app.get('/', async (_req, resp) => {
    resp.sendFile(path.resolve(__dirname,'index.html'));
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

