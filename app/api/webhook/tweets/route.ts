import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Webhook secret for security
const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET || "trenchmark-tweets-webhook-2025";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate webhook secret
    if (body.secret !== WEBHOOK_SECRET) {
      console.error("Invalid webhook secret");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (body.type !== "tweet" || body.action !== "create") {
      return NextResponse.json(
        { success: false, error: "Invalid webhook type or action" },
        { status: 400 }
      );
    }

    const data = body.data;

    // Validate required tweet data
    if (!data.tweet_id || !data.username || !data.token_address) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert tweet into Supabase
    const { data: insertedTweet, error } = await supabaseServer
      .from("tweets")
      .insert({
        tweet_id: data.tweet_id,
        username: data.username,
        tweet_text: data.tweet_text || "",
        token_address: data.token_address,
        token_name: data.token_name || null,
        token_symbol: data.token_symbol || null,
        token_image_url: data.token_image_url || null,
        submitted_at: data.submitted_at || new Date().toISOString(),
        verified_at: data.verified_at || new Date().toISOString(),
        is_legit: data.is_legit !== undefined ? data.is_legit : true,
        airtable_record_id: data.airtable_record_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting tweet:", error);
      return NextResponse.json(
        { success: false, error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Tweet inserted successfully:", insertedTweet.id);

    return NextResponse.json({
      success: true,
      message: "Tweet inserted successfully",
      tweet_id: insertedTweet.id,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
