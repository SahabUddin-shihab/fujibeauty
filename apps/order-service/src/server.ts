import { createApp } from "./app";

const app= createApp();

app.listen(5003,()=>{
    console.log('order service is running on posrt 5003');
});