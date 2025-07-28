// app/api/pages/[id]/like/route.js
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Page from "@/models/Page";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(request, { params }) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const pageId = resolvedParams.id;

  if (!Types.ObjectId.isValid(pageId)) {
    return NextResponse.json({ error: "Invalid page ID" }, { status: 400 });
  }

  try {
    await dbConnect();
    const page = await Page.findById(pageId).lean();
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await Page.findByIdAndUpdate(pageId, {
      $addToSet: { likes: session.user.id },
      $inc: { likeCount: 1 },
    });

    return NextResponse.json({ message: "Page liked" }, { status: 200 });
  } catch (error) {
    console.error("Error liking page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (request.method !== "DELETE") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const pageId = resolvedParams.id;

  if (!Types.ObjectId.isValid(pageId)) {
    return NextResponse.json({ error: "Invalid page ID" }, { status: 400 });
  }

  try {
    await dbConnect();
    const page = await Page.findById(pageId).lean();
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await Page.findByIdAndUpdate(pageId, {
      $pull: { likes: session.user.id },
      $inc: { likeCount: -1 },
    });

    return NextResponse.json({ message: "Page unliked" }, { status: 200 });
  } catch (error) {
    console.error("Error unliking page:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}