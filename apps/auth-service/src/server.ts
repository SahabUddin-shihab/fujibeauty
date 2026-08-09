import { createApp } from "./app";


const app= createApp();

app.use('/',(req,res)=>{

    res.json('Hello from auth-service');
});

app.listen(5001,()=>{
    console.log('Auth service is runnng on port 50001');
});