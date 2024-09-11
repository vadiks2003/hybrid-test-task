// run tsc on server ts and instantly run compiled file
const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['server.ts'],
    bundle: true,
    outfile: 'server.js',
    platform: 'node',
}).then(()=>Run());

function GetArgument(arg)
{
    for(let i = 0; i < process.argv.length; i++)
    {
        if(process.argv[i] != arg) continue;
        else return true;
    }
}
function Run(){
    if(GetArgument("--buildOnly"))
    {
        console.log("only build");
    }
    else{
        const  { init } = require('./server.js');
        console.log("build and init.")
        init();
    }
        
}