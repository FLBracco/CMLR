import app from './app.js';
import './config/env.js'

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`); 
});