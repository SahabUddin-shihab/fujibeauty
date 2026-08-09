import { createApp } from "./app";

const app= createApp();

app.listen(5002, ()=>{
    console.log('Notification service is running now');
});