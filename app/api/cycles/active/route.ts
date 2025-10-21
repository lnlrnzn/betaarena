import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const revalidate = 60; // Cache for 60 seconds (cycle rarely changes)

export async function GET() {
  try {
    const { data: activeCycle, error } = await supabaseServer
      .from("cycles")
      .select("id, cycle_number, start_date, end_date, is_active")
      .eq("is_active", true)
      .single();

    if (error) {
      // If no active cycle found, return 404
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "No active cycle found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(activeCycle);
  } catch (error) {
    console.error("Error fetching active cycle:", error);
    return NextResponse.json(
      { error: "Failed to fetch active cycle" },
      { status: 500 }
    );
  }
}
