import { Request, Response } from 'express';
import Posts from '../models/Posts';
import cloudinary from 'cloudinary';
import fs from 'fs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Interface for the Authenticated Request
interface AuthenticatedRequest extends Request {
  user?: { userId: string; name: string };
}

// Upload Image

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


// Post Content
export const postContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

// Get Posts
export const getPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  try {
    const posts = await Posts.find({ createdBy: userId }).sort("-createdAt");
    res.status(200).json({ posts, nbhits: posts.length });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get Single Post
export const getSinglePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const postId = req.params.id;

  try {
    const post = await Posts.findOne({ _id: postId, createdBy: req.user?.userId });
    if (!post) {
      res.status(404).json({ msg: `No post with id: ${postId}` });
      return;
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Edit Post
export const editPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const postId = req.params.id;
  const { image, content, category } = req.body;

  if (!image || !content || !category) {
    res.status(400).json({ msg: "Input fields shouldn't be empty" });
    return;
  }

  try {
    const editedPost = await Posts.findOneAndUpdate(
      { _id: postId, createdBy: userId },
      { image, content, category },
      { new: true, runValidators: true }
    );
    res.status(200).json({ msg: "Post updated", editedPost });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Delete Post
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
