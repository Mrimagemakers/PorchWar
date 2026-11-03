import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=import.meta.dirname;
const port=Number(process.env.PORT)||4175;
const server=http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}const data=await readFile(file);res.setHeader('Cache-Control','no-cache');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
server.on('error',error=>{console.error(`Could not start Porch War on port ${port}: ${error.message}`);process.exitCode=1;});
server.listen(port,'0.0.0.0',()=>console.log(`Porch War: http://localhost:${port}`));

