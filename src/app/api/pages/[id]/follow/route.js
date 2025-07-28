import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const currentUser = await User.findById(session.user.id);
  const userToFollow = await User.findById(params.id);

  if (!userToFollow) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (currentUser._id.equals(userToFollow._id)) {
    return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 });
  }

  const isFollowing = currentUser.following.includes(userToFollow._id);

  try {
    if (isFollowing) {
      await User.findByIdAndUpdate(currentUser._id, { $pull: { following: userToFollow._id } });
      await User.findByIdAndUpdate(userToFollow._id, { $pull: { followers: currentUser._id } });
      return NextResponse.json({ message: "Successfully unfollowed", isFollowing: false });
    } else {
      await User.findByIdAndUpdate(currentUser._id, { $push: { following: userToFollow._id } });
      await User.findByIdAndUpdate(userToFollow._id, { $push: { followers: currentUser._id } });
      return NextResponse.json({ message: "Successfully followed", isFollowing: true });
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
