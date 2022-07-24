import argon2 from "argon2";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {

  @Mutation(() => User)
  async register(
    @Arg('options') optios:UsernamePasswordInput,
    @Ctx() {em}:MyContext
  ): Promise<User> {
    const hasPassword = await argon2.hash(optios.password);
    const user = em.create(User,{
        username:optios.username,
        password: hasPassword
    })
    await em.persistAndFlush(user);
    return user; 
  }
}