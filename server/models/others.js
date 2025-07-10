import mongoose, { Schema } from 'mongoose';

// Times Schema (embedded in PersonalAvailability)
export const TimesSchema = new Schema({
  days: { type: String, required: true },   // "Monday" or "MWF"
  hours: { type: String, required: true }   // "10:00-12:00"
});

// Wishlist Schema
export const WishlistSchema = new Schema({
  ids_of_teachers: {
    type: [mongoose.Types.ObjectId],
    ref: 'Teacher',
    required: true
  }
});

// Achievements Schema
export const AchievementSchema = new Schema({
  type: { type: String, required: true },   
  label: { type: String, required: true },  
  isCurrent: { type: Boolean, default: true }
});

// Personal Availability Schema
export const PersonalAvailabilitySchema = new Schema({
  times: {
    type: [TimesSchema],
    default: [],
    required: true
  },
  note: {
    type: String,
    default: ""
  }
});

export const Wishlist = mongoose.model("Wishlist", WishlistSchema);
export const Achievement = mongoose.model("Achievement", AchievementSchema);
export const PersonalAvailability = mongoose.model("PersonalAvailability", PersonalAvailabilitySchema);