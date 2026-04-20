import mongoose, { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // Actions: login, login_2fa, logout, password_change, profile_update, account_lock, role_changed, account_blocked, account_unblocked
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed, // For any extra context
    },
  },
  { timestamps: true }
);

// Force model refresh in development to avoid cached enum validation errors
if (mongoose.models.AuditLog) {
  delete mongoose.models.AuditLog;
}

const AuditLog = mongoose.models.AuditLog || model('AuditLog', AuditLogSchema);

export default AuditLog;
