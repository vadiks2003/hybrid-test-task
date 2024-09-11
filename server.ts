const { createServer } = require ('node:http')
const fs = require('node:fs');
const https = require('https');

import { IncomingMessage, request, Server, ServerResponse } from 'node:http';
import { json } from 'stream/consumers';

function Init(){
    const hostname: string = `localhost`;
    const port: number = 3000;
    const server: Server = createServer(HandleRequests);

    function HandleRequests(req: IncomingMessage, res: ServerResponse)
    {
        if(req.url == "/")
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            fs.readFile('./static-front-end/index.html', (err, data) => {
                if(err) return; 
                res.end(data);
            });
        }
        else if(req.url == "/style.css")
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            fs.readFile('./static-front-end/style.css', (err, data) => {
                if(err) return; 
                res.end(data);
            });
        }

        // it would be perfect to store it inside /api folder, but the existence of req,res confuses me and i've been working on it for approximately 4 hours by now and cannot think any more.
        else if(req.url?.startsWith("/api/rates")){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');

            // unoptimized and only works for single query
            // perfectly i'd use express.js, or make a query parser, but 
            // i haven't seen anything about express js on your website, so i am doing minimal node js for now
            
            if(req.url.includes("?currency="))
            {
                const key: string = req.url.slice(req.url.indexOf("=") + 1, 
                                            req.url.length);
                if(key == ""){
                    res.statusCode = 404;
                    res.end(`"Empty query!"`)
                }
                const response = https.get(`https://api.coincap.io/v2/assets?search=${key}&limit=1`, res2 => {
                    let data: Uint8Array[] = [];
                    res2.on('data', (chunk) => {
                        data.push(chunk);
                    });
                    res2.on('end', () => {
                        let realResponse;
                        try{
                            realResponse = Buffer.concat(data).toString();
                        }
                        // doesn't look right
                        catch(err){
                            res.statusCode = 404;
                            res.end(`"error! ${err}"`)
                        }
                        const objectResponse = JSON.parse(realResponse).data[0];
                        if(objectResponse.id != key)
                        {
                            res.statusCode = 404;
                            res.end(`"haven't found exact name, but found ${objectResponse.id} with dollar value of ${objectResponse.priceUsd}"`);
                        }
                        else{
                            const usdPrice = JSON.stringify({"USD": objectResponse.priceUsd});
                            res.end(usdPrice);
                        }
                    });
                });
            }   
        }
        else{
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            res.end("no such route.")
        }
    }
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

module.exports = {
    init: Init
}