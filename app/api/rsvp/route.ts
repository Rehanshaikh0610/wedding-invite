import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const rsvpSchema = new mongoose.Schema({
  name: String, email: String, attending: String, guests: String, message: String,
});

const Rsvp = mongoose.models.Rsvp || mongoose.model('Rsvp', rsvpSchema);

export async function POST(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) await mongoose.connect(process.env.MONGODB_URI!);
    const body = await req.json();
    await Rsvp.create(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}