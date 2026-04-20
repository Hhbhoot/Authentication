import mongoose, { Schema, model, models } from 'mongoose';

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['admin', 'user'],
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

const Role = models.Role || model('Role', RoleSchema);

export default Role;
