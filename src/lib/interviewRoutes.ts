const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function slugifyInterviewLabel(value: string, fallback = "live-interview") {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function resolveInterviewId(
  routeSegment: string,
  interviewId?: string,
) {
  if (interviewId && UUID_PATTERN.test(interviewId)) {
    return interviewId;
  }

  if (UUID_PATTERN.test(routeSegment)) {
    return routeSegment;
  }

  return null;
}
