import argon2 from "argon2";
import { MyContext } from "src/types/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constant";
import { User } from "../entities/User";
import { sendEmail } from "../utils/sendMail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  error?: FieldError[]

  @Field(() => User, {nullable:true})
  user?: User
}
@Resolver()
export class UserResolver {
  @Query(() => User)
  async me(
    @Ctx() {em,req}:MyContext
  ){
    if(!req.session.userId){
      return null;
    }
    const user = await em.findOne(User, {id: req.session.userId})
    return user;
  } 
  
  @Mutation(() => Boolean)
  async forgotPassword (
    @Arg('email') email:string,
    @Ctx() {em, redis}: MyContext
    ) {
    
    const user = await em.findOne(User, {email})
    if(!user) {
       return true;
    }
    
    //creating a token
    const token = v4();

    //storing in redis
    await redis.set(
      FORGOT_PASSWORD_PREFIX+token, 
      user.id, 
      "EX", 1000*60*60*24*3
      ); // for three days
    
    sendEmail(email, 
    `<a href="http://localhost:3000/change-password/${token}">Reset Password<a/>`)
    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') optios:UsernamePasswordInput,
    @Ctx() {em, req}:MyContext
  ): Promise<UserResponse> {
     
    const error = validateRegister(optios); 
     if(error){
       return {error}
     }

    const hasPassword = await argon2.hash(optios.password);
    const user = em.create(User,{
        username:optios.username,
        password: hasPassword,
        email: optios.email
    })
    try {
       await em.persistAndFlush(user);

       //Another solution insert user data with createQueryBuilder
        // const result =  await( em as EntityManager)
        // .createQueryBuilder(User)
        // .getKnexQuery()
        // .insert({
        //    username:options.username,
        //    password: hasPassword,
        //    created_at: new Date(),
        //    updated_at: new Date()
        // })
        // .returning("*")
        // user = result[0];
    } catch (err) {
      console.log(err);
      if (err.code === '23505' && err.constraint === 'user_username_unique') {
        return {
          error: [
            {
              field: 'username',
              message: 'username already in use',
            },
          ],
        };
      } else if (err.code === '23505' && err.constraint === 'user_email') {
        return {
          error: [
            {
              field: 'email',
              message: 'email already in use',
            },
          ],
        };
      }
    }
    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;
    return {user}; 
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() {em, req}:MyContext

  ): Promise<UserResponse> {
    const user = await em.findOne(User,
    usernameOrEmail.includes('@')?{email: usernameOrEmail}: {username: usernameOrEmail})
    if(!user) {
      return{
        error:[{
          field: 'usernameOrEmail',
          message: "user not found"     
        }]
      }
    }
    const valid = await argon2.verify(user.password, password);
    if(!valid){
      return {
        error: [{
          field: 'password',
          message: "password does not match"    
        }]
      }
    }
    req.session.userId = user.id;
    return {
      user
    };
  }

  @Mutation(() => Boolean)
  async logout(
    @Ctx() {req, res}:MyContext
  ){
    return new Promise((resolve) => req.session.destroy((err) => {
      res.clearCookie(COOKIE_NAME)
      if(err){
        resolve(false);
        return;
      }
      resolve(true); 
    }))
  }
}
