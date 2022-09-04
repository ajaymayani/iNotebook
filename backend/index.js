const connectToMongo = require('./db');
connectToMongo();
const express = require('express');
const app= express();
const port = 5000;

app.use(express.json())
app.use('/api/auth',require('./routers/auth'));
app.use('/api/note',require('./routers/notes'));


app.listen(port,()=>{
    console.log(`Listening at  https://localhost:${port}`)
})