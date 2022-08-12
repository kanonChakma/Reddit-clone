import argon2 from "argon2";
import { MyContext } from "src/types/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { COOKIE_NAME } from "../constant";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
  }

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}
@ObjectType()
class UserResponse{
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

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') optios:UsernamePasswordInput,
    @Ctx() {em, req}:MyContext
  ): Promise<UserResponse> {
    if(optios.username.length<=2){
      return{
        error: [
          {
            field:"username",
            message:"length should be greater than length 2 "
          }
        ]
      }
    }
    if(optios.password.length<=3){
      return{
        error: [
          {
            field:"password",
            message:"password length should be greater than length 3 "
          }
        ]
      }
    }
    const hasPassword = await argon2.hash(optios.password);
    const user = em.create(User,{
        username:optios.username,
        password: hasPassword
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
    @Arg('options') optios:UsernamePasswordInput,
    @Ctx() {em, req}:MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User,{username: optios.username})
    if(!user) {
      return{
        error:[{
          field: 'username',
          message: "user not found"     
        }]
      }
    }
    const valid = await argon2.verify(user.password, optios.password);
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
