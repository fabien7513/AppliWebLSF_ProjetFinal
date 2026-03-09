import express from "express";
import "dotenv/config";
import { authRouter } from "./routers/authRouter.js";
import session from "express-session";
import path from "node:path";
import { mainRouter } from "./routers/homeRouter.js";


const app = express()


app.use ('/static', express.static(path.resolve('public')))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
}))

app.use(express.urlencoded({ extended:true}))


app.use(authRouter);
app.use(mainRouter);

app.listen(process.env.PORT, (error)=>{
    if (error) {
        console.error(error);
    }else{
        console.log("Serveur démarré");
        
    }
})


// pour vérifier si ça fonctionne! mais c'est ok! :)
// app.get("/", (req, res) => {
//     res.send("Le serveur fonctionne !");
// });