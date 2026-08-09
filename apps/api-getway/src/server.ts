import { createApp } from "./app";

import router from "./routes/proxy.routes";

const app= createApp();

app.use('/',router);

app.use('/',(req,res)=>{
    res.json("Hello from api-getway");
});

app.listen(5000,()=>{
    console.log('System is running on server port: 5000');
});


