import express from "express"
import cors from "cors"
const app = express()

//Basic configurations 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))

//CORS configuration
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET" , "POST" , "PUT" , "PATCH" , "DELETE" , "OPTIONS"],
    allowedHeaders : ["Authorization","Content-Type"]
}))

//import the routes  
import healthCheckRoute from './routes/healthcheck.routes.js'
app.use('/api/v1/healthcheck',healthCheckRoute)

app.get("/" , (req , res)=>{
    res.send("This is my first project")
})

export default app