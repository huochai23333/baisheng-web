import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getServerSupabaseClient } from "@/lib/supabase-server";

const EMAIL_CONFIRMATION_TYPE = "email" satisfies EmailOtpType;
const DEFAULT_REDIRECT_PATH = "/login";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextPath = getSafeRedirectPath(
    requestUrl.searchParams.get("next"),
    requestUrl.origin,
  );

  if (!tokenHash || type !== EMAIL_CONFIRMATION_TYPE) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url));
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: EMAIL_CONFIRMATION_TYPE,
  });

  if (error) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}

function getSafeRedirectPath(value: string | null, origin: string) {
  if (!value) {
    return DEFAULT_REDIRECT_PATH;
  }

  try {
    const url = new URL(value, origin);

    if (url.origin !== origin) {
      return DEFAULT_REDIRECT_PATH;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_REDIRECT_PATH;
  }
}
