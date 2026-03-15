// Govardhan Farm — OTP Edge Function  (v3 — all security fixes applied)
// FIX H-01: Verification now done server-side; browser never reads otp_codes
// FIX H-02: Server-side 60s rate limit on OTP send
// FIX H-03: Brute force protection — max 5 wrong attempts per OTP

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin":  "*", // Restrict to your domain once deployed
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};
const JSON_HEADERS = { ...CORS, "Content-Type": "application/json" };

const ok  = (data: object)   => new Response(JSON.stringify(data), { status: 200, headers: JSON_HEADERS });
const err = (msg: string, status = 400) => new Response(JSON.stringify({ error: msg }), { status, headers: JSON_HEADERS });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body   = await req.json();
    const action = body.action || "send"; // "send" or "verify"

    // Supabase client using service role — safe server-side only
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    /* ══════════════════════════════════════
       ACTION: SEND OTP
    ══════════════════════════════════════ */
    if (action === "send") {
      const { phone } = body;

      if (!phone || !/^91[6-9][0-9]{9}$/.test(phone)) {
        return err("Invalid phone number. Must be a 10-digit Indian mobile number.");
      }

      // FIX H-02: Server-side rate limit — one OTP per 60 seconds
      const { data: recent } = await supabase
        .from("otp_codes")
        .select("created_at")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recent && recent.length > 0) {
        const lastSent = new Date(recent[0].created_at).getTime();
        const elapsed  = Date.now() - lastSent;
        if (elapsed < 60_000) {
          const wait = Math.ceil((60_000 - elapsed) / 1000);
          return err(`Please wait ${wait}s before requesting another OTP.`);
        }
      }

      // Generate OTP
      const otp     = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Clear old unused OTPs for this phone
      await supabase.from("otp_codes").delete().eq("phone", phone).eq("used", false);

      // Insert new OTP with attempts counter
      const { error: insertErr } = await supabase
        .from("otp_codes")
        .insert({ phone, code: otp, expires_at: expires, attempts: 0 });

      if (insertErr) return err("Could not save OTP: " + insertErr.message, 500);

      // Send SMS via Fast2SMS
      const fast2smsKey = Deno.env.get("FAST2SMS_KEY");
      if (!fast2smsKey) return err("SMS service not configured.", 500);

      const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: { "authorization": fast2smsKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          route:    "q",
          message:  `${otp} is your Govardhan Farm login code. Valid for 5 minutes. Do not share.`,
          language: "english",
          flash:    0,
          numbers:  phone.slice(2), // Fast2SMS needs 10-digit number
        }),
      });

      const smsData = await smsRes.json();
      if (!smsData.return) return err(smsData.message || "SMS sending failed.", 500);

      return ok({ success: true, message: "OTP sent successfully." });
    }

    /* ══════════════════════════════════════
       ACTION: VERIFY OTP
       FIX H-01: Verification is server-side only
       FIX H-03: Max 5 attempts before lockout
    ══════════════════════════════════════ */
    if (action === "verify") {
      const { phone, code } = body;

      if (!phone || !code) return err("Phone and code are required.");
      if (!/^\d{6}$/.test(code)) return err("Invalid OTP format.");

      const { data: rows, error: fetchErr } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", phone)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchErr || !rows || rows.length === 0) {
        return err("No active OTP found. Please request a new one.");
      }

      const row = rows[0];

      // FIX H-03: Check attempt count
      if ((row.attempts || 0) >= 5) {
        // Invalidate OTP
        await supabase.from("otp_codes").update({ used: true }).eq("id", row.id);
        return err("Too many incorrect attempts. Please request a new OTP.");
      }

      // Check expiry
      if (new Date(row.expires_at) < new Date()) {
        await supabase.from("otp_codes").update({ used: true }).eq("id", row.id);
        return err("OTP has expired. Please request a new one.");
      }

      // Check code
      if (row.code !== code) {
        // FIX H-03: Increment attempt counter
        await supabase.from("otp_codes")
          .update({ attempts: (row.attempts || 0) + 1 })
          .eq("id", row.id);
        const remaining = 4 - (row.attempts || 0);
        return err(`Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
      }

      // Mark as used
      await supabase.from("otp_codes").update({ used: true }).eq("id", row.id);

      return ok({ success: true, message: "OTP verified." });
    }

    return err("Unknown action.", 400);

  } catch (e) {
    return err(e.message || "Internal server error.", 500);
  }
});
