import express from "express";
import "dotenv/config";
import { authRouter } from "./routers/authRouter.js";
import session from "express-session";
import path from "node:path";
import { mainRouter } from "./routers/homeRouter.js";
import { interpretersRouter } from "./routers/interpretersRouter.js";
import { scheduleInterpretersRouter } from "./routers/scheduleInterpretersRouter.js";
import { profileRouter } from "./routers/profileRouter.js";
import { reservationsRouter } from "./routers/reservationsRouter.js";
import { requestRouter } from "./routers/requestRouter.js";
import legalRouter from "./routers/legalRouter.js";



const app = express()



app.use ('/static', express.static(path.resolve('public')))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
}))

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});



app.use(express.urlencoded({ extended:true}))
app.use(express.json())


app.use(authRouter);
app.use(mainRouter);
app.use(interpretersRouter);
app.use(scheduleInterpretersRouter);
app.use(profileRouter);
app.use(reservationsRouter);
app.use(requestRouter)
app.use("/legal", legalRouter);
app.listen(process.env.PORT, (error)=>{
    if (error) {
        console.error(error);
    }else{
        console.log("Serveur démarré sur le port " + process.env.PORT);
        
    }
})


// pour vérifier si ça fonctionne! mais c'est ok! :)
// app.get("/", (req, res) => {
//     res.send("Le serveur fonctionne !");
// });