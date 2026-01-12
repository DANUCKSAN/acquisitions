import logger from'#config/logger.js';
import bcrypt from 'bcrypt';
import {eq} from 'drizzle-orm';
import {db} from'#config/database.js'; 
import{users} from '#models/user.model.js';   

export const hashPassword = async (password) => {
  try{
    return await bcrypt.hash(password, 10);
}catch(err){
        logger.error(`Error hashing password : ${err}`);
        throw new Error('Failed to hash password');
    }
};

export const createUser=async({name, email, password, role='user'})=>{
    try{
        const existingUser=db.select().from(users).where(eq(users.email,email)).limit(1);
        if(existingUser.length>0) throw new Error('User with this email already exists');
        const hashedPassword=await hashPassword(password);
       const [newUser]= await db
       .insert(users)
       .values({ name, email, password:hashedPassword, role})
       .returning({
        id:users.id,
        name:users.name,
        email:users.email,
        role:users.role,
       });
       logger.info(`User created successfully: ${email}`);
       return newUser;
     

            
        }catch(err){
        logger.error(`Error creating user : ${err}`);
        throw new Error('Failed to create user');
    }
};