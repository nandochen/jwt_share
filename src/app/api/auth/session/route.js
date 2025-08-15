import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  return new Response(JSON.stringify(session), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
