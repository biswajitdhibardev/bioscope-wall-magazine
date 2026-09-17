import { createClient } from "@supabase/supabase-js";

// Node.js 20+ can load .env files directly. This makes the setup script
// work when it is run outside of Next.js as well.
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env.local");
  }
} catch (error) {
  console.error("Could not load .env.local:", error.message);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error("Missing required environment variables.");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  console.log("Setting up admin account...");

  let user;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (created?.user) {
    user = created.user;
    console.log("Admin user created.");
  } else if (
    createError?.message?.toLowerCase().includes("already been registered")
  ) {
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (listError) throw listError;

    user = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      throw new Error(
        "The admin email exists, but its user record could not be found."
      );
    }

    const { error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
      });

    if (updateError) throw updateError;
    console.log("Existing admin user updated.");
  } else if (createError) {
    throw createError;
  }

  if (!user?.id) {
    throw new Error("Could not determine the admin user ID.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, email, role: "admin" },
      { onConflict: "id" }
    );

  if (profileError) throw profileError;

  console.log("");
  console.log("Admin account is ready: " + email);
  console.log("Role: admin");
  console.log("You can now sign in at /admin/login");
}

setupAdmin().catch((error) => {
  console.error("");
  console.error("Admin setup failed:");
  console.error(error?.message || error);
  process.exit(1);
});
