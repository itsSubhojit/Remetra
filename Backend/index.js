import app from "./app.js";
import {dbConnect} from "./src/config/db.js";
import { sendReminderEmail } from "./src/services/emailService.js";


dbConnect()
.then( () =>{
    app.listen(process.env.PORT || 8000);
    console.log(`Server is Running on port ${process.env.PORT}`)
})
.catch((error) =>{
    console.log("Server Start Fail!!!")
    process.exit(1);
})


//sendReminderEmail("your-email@gmail.com", "Test", "This is a test reminder")