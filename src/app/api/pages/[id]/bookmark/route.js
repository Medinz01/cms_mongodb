import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const pageId = params.id;

  try {
    const existingBookmark = await Bookmark.findOne({ user: userId, page: pageId });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return NextResponse.json({ message: "Bookmark removed", isBookmarked: false });
    } else {
      await new Bookmark({ user: userId, page: pageId }).save();
      return NextResponse.json({ message: "Page bookmarked", isBookmarked: true });
    }
  } catch (error) {
    console.error("Bookmark API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
