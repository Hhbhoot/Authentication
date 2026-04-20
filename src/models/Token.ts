import mongoose, { Schema, model, models } from 'mongoose';

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['verification', 'reset', 'refresh'],
      required: true,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: delete when current time > expiresAt
    },
  },
  { timestamps: true }
);

const Token = models.Token || model('Token', TokenSchema);

export default Token;
