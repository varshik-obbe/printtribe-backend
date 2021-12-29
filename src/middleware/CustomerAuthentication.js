
const CustomerAuthentication = (req,res,next) =>{
    next();
    // const header = req.headers.authorization;
    // if(header){
    //     const token = header.split(" ")[1];
    //     if(token){
    //         jwt.verify(token, 'SECRET', (err,decode)=>{
    //             if(err){
    //                 res.status(401).json({errors:{global:"invalid token"}});
    //             }else{
    //                 // req.email = decode.email;
    //                 User.find({email:decode.email}).exec().then((user)=>{
    //                     req.currentUser = user;
    //                     next();
    //                     //const todayDate = new Date();
    //                     // if(user[0].active === '1'){
    //                     //     if(user[0].enddate){
    //                     //         if((new Date(todayDate) <= new Date(user[0].enddate))){
    //                     //             next();
    //                     //         }else{
    //                     //             res.status(400).json({errors:{global:"invalid token"}});
    //                     //         }
    //                     //     }else{
    //                     //         next();
    //                     //     }
    //                     // }else{
    //                     //     res.status(400).json({errors:{global:"invalid token"}});                
    //                     // }
    //                 })
                   
    //             }
    //         })
    //     }else{
    //         res.status(500).json({errors:{global:"token not found"}});
    //     }
    // }else{
    //     res.status(500).json({errors:{global:"token not found"}});
    // } 
}

export default CustomerAuthentication;