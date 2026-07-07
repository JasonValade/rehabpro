# Supabase Setup for RehabPro MVP

## Status

✓ Environment configured  
✓ Connected to Supabase  
✓ Database schema (tables + RLS) present  
✗ **Exercise seeds missing** ← Fix this to enable intake flow

## Quick Fix: Apply Seed Migrations

If you have `supabase` CLI installed:

```bash
# List migrations
supabase migration list

# Apply seed migrations (this will populate exercises table)
supabase migration up
```

If you don't have the CLI, apply the SQL directly in Supabase dashboard:

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the contents of `supabase/migrations/202606300001_expand_starter_exercise_seeds.sql`
4. Run it

After applying seeds, verify setup:

```bash
node scripts/verify-supabase-setup.js
```

You should see all green ✓ checks.

## What Gets Created

The seed migration (`202606300001_expand_starter_exercise_seeds.sql`) inserts ~50+ exercises including:

- Basic movements: Quad Sets, Heel Slides, Straight Leg Raise
- Strength work: Terminal Knee Extension, Wall Slides, Step-Ups
- Balance/proprioception: Single-Leg Balance, Drop Landing
- Loading progressions for different rehab phases

These exercises are then mapped to 10 starter plan templates based on:
- Injury type (ACL + Meniscus, Patellar Tendon, Achilles, Other)
- Rehab phase (Early Motion, Strength, Return to Running, Return to Sport)

## Testing the Full Flow

Once seeds are applied:

```bash
npm run dev
```

Then:
1. **Sign up** with a new email
2. **Complete intake** (3 steps: profile → injury path → baseline symptoms)
3. **Submit** to create starter plan
4. **View training** - should show exercises from your starter plan with videos

Each new patient gets a plan with 4-5 exercises specific to their injury and phase.

## Troubleshooting

Run verification anytime:
```bash
node scripts/verify-supabase-setup.js
```

**Still missing exercises?**
- Check Supabase dashboard → SQL Editor → `SELECT COUNT(*) FROM exercises`
- If count is 0, the seed migration didn't run

**Can't sign up?**
- Enable email confirmations or disable them in Supabase Auth settings
- See `.env.example` for configuration options

**Exercises loading but intake hangs?**
- Check browser console for errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are correct in `.env`

---

For more details, see [PRODUCT_VISION.md](../PRODUCT_VISION.md) and [README.md](../README.md)
