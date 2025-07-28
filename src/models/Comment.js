import mongoose, { Schema, models } from 'mongoose';

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

CommentSchema.post('save', async function(doc) {
  try {
    const Page = mongoose.model('Page');
    await Page.findByIdAndUpdate(doc.page, { $inc: { commentCount: 1 } });
  } catch (error) {
    console.error("Error updating page comment count after save:", error);
  }
});

CommentSchema.post('remove', async function(doc) {
    try {
        const Page = mongoose.model('Page');
        await Page.findByIdAndUpdate(doc.page, { $inc: { commentCount: -1 } });
    } catch (error) {
        console.error("Error updating page comment count after remove:", error);
    }
});


const Comment = models.Comment || mongoose.model('Comment', CommentSchema);
export default Comment;
