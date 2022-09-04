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
   me(
    @Ctx() {req}:MyContext
  ) {
    if(!req.session.userId){
      return null;
    }
    return User.findOne({where: {id: req.session.userId}});

  } 

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() {redis, req }: MyContext
    ):Promise<UserResponse>{

      if(newPassword.length <=3 ) {
        return {
          error: [
            {
              field:"newPassword",
              message:"password length should be greater than length 3 "
            }
          ]
        }
      }
     
     const key =FORGOT_PASSWORD_PREFIX+token;
     const userId = await redis.get(key);
     if(!userId) {
      return {
        error: [
          {
            field:"token",
            message:"token are expired"
          }
        ]
      }
     }
    const userIdNum = parseInt(userId);

    const user = await User.findOne({where: {id: userIdNum}}) 
    if(!user){
      return {
        error: [
          {
            field:"token",
            message:"user does not exist"
          }
        ]
      }
    }

    User.update({id: userIdNum}, {password: await argon2.hash(newPassword)})
    await redis.del(key);
    //login after change password
    req.session.userId = user.id;
    return {user};
  }

  @Mutation(() => Boolean)
  async forgotPassword (
    @Arg('email') email:string,
    @Ctx() {redis}: MyContext
    ) {
    
    const user = await User.findOne({where: {email}})
 
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
    @Ctx() {req}:MyContext
  ): Promise<UserResponse> {
     
    const error = validateRegister(optios); 
     if(error){
       return {error}
     }

    const hasPassword = await argon2.hash(optios.password);
    
    let user;
    try {
       const result = await User.create({
          username:optios.username,
          email: optios.email,
          password: hasPassword,
        }).save();
      console.log(result);
      user = result;
    } catch (err) {
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
    req.session.userId = user?.id;
    return {user}; 
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() {req}:MyContext

  ): Promise<UserResponse> {
    const user = await User.findOne(
    usernameOrEmail.includes('@')?{where: {email: usernameOrEmail}}: {where: {username: usernameOrEmail }})
    if(!user) {
      return{
        error:[{
          field: 'usernameOrEmail',
          message: "user not found"     
        }]
      }
    }
    const valid = await argon2.verify(user.password, password);
    if(!valid) {
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
      if(err) {
        resolve(false);
        return;
      }
      resolve(true); 
    }))
  }
}
