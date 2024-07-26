import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
