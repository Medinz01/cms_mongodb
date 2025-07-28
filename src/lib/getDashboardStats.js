// lib/getDashboardStats.js
import dbConnect from './db';
import User from '@/models/User';
import Page from '@/models/Page';
import Tag from '@/models/Tag';
import mongoose from 'mongoose';

export async function getDashboardStats() {
  await dbConnect();

  const [userCount, pageCount, tagCount] = await Promise.all([
    User.countDocuments(),
    Page.countDocuments(),
    Tag.countDocuments()
  ]);

  const popularTags = await Page.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tagDetails' } },
    { $unwind: '$tagDetails' },
    { $project: { _id: 0, name: '$tagDetails.name', count: 1 } }
  ]);

  const topContributors = await Page.aggregate([
    { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
    { $unwind: '$userDetails' },
    { $project: { _id: 0, name: '$userDetails.name', count: 1 } }
  ]);

  return {
    userCount,
    pageCount,
    tagCount,
    popularTags,
    topContributors
  };
}