import { MyContext } from "src/types/types";
import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";


@ObjectType()
class InputField {
  @Field()
  title: string

  @Field()
  text: string
}

@Resolver()
export class PostsResolver {

  @Query(() => [Post])
  posts (): Promise<Post[]> {
   return Post.find()
  }

  @Query(() => Post, {nullable: true})
  post(@Arg('id', () => Int) id:number):Promise<Post | null> {
     return Post.findOne({where: {id}}); 
  }
  
  @Mutation(() =>Post)
  async createPost(
    @Arg('input') input: InputField,
    @Ctx() {req}: MyContext
    ) : Promise<Post> {
     return Post.create({
       ...input,
       creatorId: req.session.userId
     }).save();
    }

  @Mutation(() => Post, {nullable: true})
  async updatePost(
    @Arg('id') id:number,
    @Arg('title', {nullable:true} ) title:string,
  ): Promise<Post|null>{
    const post = await Post.findOne({where: {id}})
    if(!post){
        return null;
    }
    if(typeof title !== undefined){
      post.title = title;
      await Post.update({id}, {title})
    }
    return post;
  } 

  @Mutation(() => Boolean)
  async deletePost(
    @Arg ('id') id:number
  ):Promise<Boolean> {
    try{
     await Post.delete({id})
     return true;
    }catch(err){
        return false;
    }
  }
}