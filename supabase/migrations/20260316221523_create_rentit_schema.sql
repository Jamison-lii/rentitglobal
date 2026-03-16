/*
  # RentIt Marketplace Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `member_since` (timestamptz)
      - `rating` (decimal)
      - `total_reviews` (integer)
      - `trust_score` (integer)
      - `verification_level` (text)
      - `is_verified` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `icon` (text)
      - `created_at` (timestamptz)

    - `items`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles)
      - `category_id` (uuid, references categories)
      - `name` (text)
      - `description` (text)
      - `price_per_day` (decimal)
      - `security_deposit` (decimal)
      - `images` (text array)
      - `rating` (decimal)
      - `location` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `distance_miles` (decimal)
      - `features` (jsonb)
      - `is_available` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `rentals`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references items)
      - `renter_id` (uuid, references profiles)
      - `owner_id` (uuid, references profiles)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `status` (text) - 'active', 'completed', 'cancelled'
      - `total_price` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `reviews`
      - `id` (uuid, primary key)
      - `rental_id` (uuid, references rentals)
      - `reviewer_id` (uuid, references profiles)
      - `reviewee_id` (uuid, references profiles)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read public data
    - Add policies for users to manage their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  member_since timestamptz DEFAULT now(),
  rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  trust_score integer DEFAULT 0,
  verification_level text DEFAULT 'Level 1',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  description text NOT NULL,
  price_per_day decimal(10,2) NOT NULL,
  security_deposit decimal(10,2) DEFAULT 0,
  images text[] DEFAULT '{}',
  rating decimal(3,2) DEFAULT 5.0,
  location text NOT NULL,
  latitude decimal(10,6),
  longitude decimal(10,6),
  distance_miles decimal(6,2),
  features jsonb DEFAULT '{}',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active',
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rentals"
  ON rentals FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create rentals"
  ON rentals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can update their own rentals"
  ON rentals FOR UPDATE
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their rentals"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
  ('Photography', '📷'),
  ('Drones', '🚁'),
  ('Electronics', '📱'),
  ('Audio', '🎧'),
  ('Outdoor', '⛰️')
ON CONFLICT (name) DO NOTHING;
