import { createApp } from "./app";

const app= createApp();

app.listen(5005,()=>{
    console.log('Product service running on 5005');
});