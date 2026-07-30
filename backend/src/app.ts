import express, {urlencoded} from 'express';

const app = express();
app.use(urlencoded({extended: false}));

app.get('/api/hello', (req, res) => {
    res.status(200).send('API funcionando correctamente');   
})

export default app;