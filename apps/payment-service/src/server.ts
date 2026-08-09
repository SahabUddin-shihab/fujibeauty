import { createApp } from "./app";

const app= createApp();

app.listen(5004,()=>{
    console.log('Payment service running on 5004');
});