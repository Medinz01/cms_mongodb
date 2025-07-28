import dbConnect from "@/lib/db";
import Page from "@/models/Page";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: "Query parameter 'q' is required" }, { status: 400 });
  }

  await dbConnect();

  try {
    const regex = new RegExp(query, 'i');

    const pages = await Page.find({ title: regex }).limit(5).lean();

    const users = await User.find({ name: regex }).limit(5).lean();

    return NextResponse.json({ pages, users });

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
