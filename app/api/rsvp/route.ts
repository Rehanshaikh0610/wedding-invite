import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const rsvpSchema = new mongoose.Schema({
  name: String, email: String, attending: String, guests: String, message: String,
});

const Rsvp = mongoose.models.Rsvp || mongoose.model('Rsvp', rsvpSchema);

export async function POST(req: Request) {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("DIAGNOSTIC: MONGODB_URI is MISSING in environment variables!");
      return NextResponse.json({ error: 'Database config missing' }, { status: 500 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(uri);
    }

    const body = await req.json();
    await Rsvp.create(body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    // This will now show the REAL error in your Vercel logs
    console.error("DIAGNOSTIC ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}