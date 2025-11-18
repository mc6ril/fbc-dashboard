# How to Apply Migration 001_create_domain_tables.sql

## Quick Start

1. **Open Supabase Dashboard**

    - Go to https://supabase.com/dashboard
    - Select your project

2. **Open SQL Editor**

    - Click **SQL Editor** in the left sidebar
    - Click **New Query**

3. **Copy and Paste Migration**

    - Open `001_create_domain_tables.sql` in your editor
    - Copy the entire file contents
    - Paste into the SQL Editor

4. **Run Migration**

    - Click **Run** button or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
    - Wait for "Success. No rows returned" message

5. **Verify Migration**
    - Run `001_verify_schema.sql` in the SQL Editor
    - Check that all tables, constraints, and indices are created
    - Review the summary query at the end

## Expected Results

After successful migration:

-   ✅ 3 tables created: `products`, `activities`, `stock_movements`
-   ✅ 2 foreign keys created
-   ✅ 27 CHECK constraints created
-   ✅ 11 indices created

## Troubleshooting

If you encounter errors:

-   Check that you're connected to the correct Supabase project
-   Ensure you have the necessary permissions
-   Review error messages in the SQL Editor
-   Check the README.md for detailed troubleshooting steps

## Next Steps

After applying the migration:

1. Verify schema using `001_verify_schema.sql`
2. Test constraint enforcement (see verification script comments)
3. Test successful inserts (see verification script comments)
4. Update Sub-Ticket 10.7 DoD in planning document
