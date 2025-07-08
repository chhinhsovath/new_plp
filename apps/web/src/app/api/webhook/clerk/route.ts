import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (!existingUser && email_addresses && email_addresses.length > 0) {
      // Create user with default student role
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || "",
          lastName: last_name || "",
          role: "STUDENT", // Default role, user can change in onboarding
        },
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete user from database
    await prisma.user.delete({
      where: { clerkId: id },
    });
  }

  return new Response("", { status: 200 });
}