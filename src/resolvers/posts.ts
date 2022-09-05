import { MyContext } from "src/types/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import dataSource from "../ormconfig";

@Resolver()
export class PostsResolver {

  @Query(() => [Post])
  async posts (
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, {nullable: true} ) cursor: string | null
  ): Promise<Post[]> {
    const realTime = Math.min(50, limit);
    const post = await dataSource
    .getRepository(Post)
    .createQueryBuilder("p")
    .orderBy('"createdAt"', "DESC")
    .take(realTime);

    if(cursor) {
      post.where('"createdAt" < :cursor', {
        cursor: new Date(cursor)
      });
    }
    return post.getMany();
  }

  @Query(() => Post, {nullable: true})
  post(@Arg('id', () => Int) id:number):Promise<Post | null> {
     return Post.findOne({where: {id}}); 
  }
  
  @Mutation(() =>Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('text') text: string,
    @Arg('title') title: string,
    @Ctx() {req}: MyContext
    ) : Promise<Post> {
     return Post.create({
       text,
       title,
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