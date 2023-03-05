import { connect } from 'mongoose';

export async function connectDatabase() {
  try {
    await connect(process.env.MONGODB_URI as string);
    console.log('Connected to database');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}