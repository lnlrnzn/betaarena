import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createErrorResponse, logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Webhook secret must be configured
    const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      logger.error('[WEBHOOK] AIRTABLE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate webhook secret
    if (body.secret !== WEBHOOK_SECRET) {
      logger.error("[WEBHOOK] Invalid webhook secret attempt");
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

    logger.info("WEBHOOK", "Tweet inserted successfully:", insertedTweet.id);

    return NextResponse.json({
      success: true,
      message: "Tweet inserted successfully",
      tweet_id: insertedTweet.id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, ...createErrorResponse(error) },
      { status: 500 }
    );
  }
}
