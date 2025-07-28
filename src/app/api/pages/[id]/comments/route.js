import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Comment from "@/models/Comment";
import Page from "@/models/Page"; 
import User from "@/models/User"; 

export async function POST(request, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
  }

  const { id } = await params; 
  const { content } = await request.json();

  if (!content || content.trim() === "") {
    return new Response(JSON.stringify({ message: "Comment content cannot be empty" }), { status: 400 });
  }

  try {
    const newComment = new Comment({
      content,
      page: id,
      createdBy: session.user.id,
    });

    await newComment.save();
    
    const populatedComment = await Comment.findById(newComment._id).populate('createdBy', 'name');

    return new Response(JSON.stringify(populatedComment), { status: 201 });

  } catch (error) {
    console.error("Error creating comment:", error);
    return new Response(JSON.stringify({ message: "Failed to create comment" }), { status: 500 });
  }
}
