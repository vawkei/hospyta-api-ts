import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter a name"],
      minlength: [3, "Name length shouldn't be less than 3 characters"],
      maxlength: [10, "Name length shouldn't be more than 10 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please enter a password"],
      minlength: [6, "Password characters should be more than 6"],
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);

