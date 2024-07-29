import { Request, Response } from 'express';
import Posts from '../models/Posts';
import cloudinary from 'cloudinary';
import fs from 'fs';
import crypto from 'crypto';

// Interface for the Authenticated Request
interface AuthenticatedRequest extends Request {
  user?: { userId: string; name: string };
}

// Upload Image================================================================>

export const upLoadImage = async (req: Request, res: Response) => {
  if (!req.files || !req.files.image) {
    res.status(400).json({ msg: "No files uploaded" });
    return;
  }

  const maxSize = 1024 * 1024; 

  if (req.files.image.size > maxSize) {
    res.status(400).json({ msg: "Please upload image smaller than 1mb" });
    return;
  }

  console.log("Image hitting cloudinary...");

  try {
    const result = await cloudinary.v2.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: "hospytaContent",
      }
    );

    console.log("Image sent to cloudinary...");
    fs.unlinkSync(req.files.image.tempFilePath); 

    console.log("Image unSynced...");
    res.status(200).json({ src: result.secure_url, publicID: result.public_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

// Post Content==================================================================>
export const postContent = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { image, content, category } = req.body;

  if (!image || !content || !category) {
    res.status(400).json({ msg: "Please fill out the inputs" });
    return;
  }

  try {
    const post = await Posts.create({ image, content, category, createdBy: userId });
    res.status(201).json({ msg: "Post created", post });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get Posts====================================================================>
export const getPosts = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  try {
    const posts = await Posts.find({}).sort("-createdAt");
    res.status(200).json({ posts, nbhits: posts.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get Single Post==============================================================>
export const getSinglePost = async (req: AuthenticatedRequest, res: Response)=> {
  
  const postId = req.params.id;
  console.log(postId);


  try {
    const post = await Posts.findOne({ _id: postId});
    if (!post) {
      res.status(404).json({ msg: `No post with id: ${postId}` });
      return;
    };

    post.postViews.viewCount ++;

    await post.save();

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Edit Post=====================================================================>
export const editPost = async (req:AuthenticatedRequest, res:Response) => {
  const userId = req.user.userId;
  const postId = req.params.id;

  const { image, content, category, userID } = req.body; // we will be expecting a     userID createdby from the frontend;

  if (!image || !content || !category || !userID) {
    return res.status(400).json({ msg: "Input fields shouldn't be empty" });
  }

  if(userId !== userID){
    return res.status(401).json({msg:"not allowed to edit"})
  };

  try {
    const editedPost = await Posts.findOneAndUpdate(
      { _id: postId, createdBy: userId },
      {
        image: image,
        content: content,
        category: category,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ msg: "post updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

// Delete Post==================================================================>
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const postId = req.params.id;

  try {
    const post = await Posts.findOneAndDelete({ _id: postId, createdBy: userId });
    if (!post) {
      res.status(404).json({ msg: `No post found with id: ${postId}` });
      return;
    }
    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//  postComments==================================================================>



export const postComments = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.id; //66a56cc4256d52ab84d554b0

  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ msg: "please leave a comment" });
  }

  //work on the date for the comment:
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = new Date().getDate();
  const month = new Date().getMonth();
  const adjustedMonth = months[month];
  console.log("Month:", month);

  const date = new Date();
  const year = new Date().getFullYear();

  const commentDate = `${day}-${adjustedMonth}-${year} ${date.toLocaleTimeString()}`;
  console.log("Date comment was made:", commentDate);

  try {
    const post = await Posts.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ msg: `no post with id: ${postId}` });
    }
    // creating an id for the comments cause mongodb wont.
    //Generate a uniqueId:
    
    const customizedID = crypto.randomBytes(12).toString("hex");
    console.log(customizedID)


    post.comments.push({
      comments:comment,
      timeOfComment: commentDate,
      userId: req.user.userId,
      name: req.user.name,
      commentIDBYCRYPTO:customizedID  
    });

    await post.save();

    res.status(201).json({ msg: "comment added", post });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }

  res.status(201).json({ msg: commentDate });
};


//7. getComments===============================================================:
//this works just like getSinglePost.
export const getComments = async(req:AuthenticatedRequest,res:Response)=>{
  const postId = req.params.id;
  const userID = req.user.userId;
  //postID: 66a77c2901509e3181ecb8a9
  try{
    const post = await Posts.findOne({_id:postId});
    if(!post){
      return res.status(404).json(`no post with id: ${postId}`)
    };

    const comments = post.comments
    console.log(comments);
    // const getSingleComment = post.comments.filter((comment)=>{
    //    return comment.userId === userID
    // })
    // console.log(getSingleComment);
    res.status(200).json({comments:comments})
  }catch(error){
    console.log(error)
    res.status(500).json(error)
  };
}
