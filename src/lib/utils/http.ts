import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, error = "bad_request") {
  return NextResponse.json({ error, message }, { status });
}
