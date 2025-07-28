import mongoose, { Schema, models } from 'mongoose';

const BookmarkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
  },
}, {
  timestamps: true,
});

BookmarkSchema.index({ user: 1, page: 1 }, { unique: true });

const Bookmark = models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
export default Bookmark;
