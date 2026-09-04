-- ResQ Emergency Response Platform Database Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number TEXT,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 40.7128,
  longitude DOUBLE PRECISION NOT NULL DEFAULT -74.0060,
  address TEXT DEFAULT '',
  severity TEXT DEFAULT 'HIGH',
  priority TEXT DEFAULT 'P2',
  urgency TEXT DEFAULT 'urgent',
  people_at_risk INTEGER DEFAULT 1,
  hazards JSONB DEFAULT '[]'::jsonb,
  response_domains JSONB DEFAULT '["police"]'::jsonb,
  recommended_resource_types JSONB DEFAULT '["police_unit"]'::jsonb,
  ai_summary TEXT DEFAULT '',
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'reported',
  reports_count INTEGER DEFAULT 1,
  assigned_resource_ids JSONB DEFAULT '[]'::jsonb,
  eta_minutes INTEGER,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 40.7128,
  longitude DOUBLE PRECISION DEFAULT -74.0060,
  status TEXT NOT NULL DEFAULT 'available',
  capability JSONB DEFAULT '[]'::jsonb,
  distance DOUBLE PRECISION DEFAULT 1.2,
  eta INTEGER DEFAULT 4,
  match_score INTEGER DEFAULT 95,
  assigned_incident_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INCIDENT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.incident_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  assigned_by TEXT DEFAULT 'Dispatcher',
  status TEXT NOT NULL DEFAULT 'assigned',
  eta_minutes INTEGER DEFAULT 5,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_assignments ENABLE ROW LEVEL SECURITY;

-- Allow public access for anonymous dev keys
CREATE POLICY "Allow anon select incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow anon insert incidents" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update incidents" ON public.incidents FOR UPDATE USING (true);

CREATE POLICY "Allow anon select resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow anon insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update resources" ON public.resources FOR UPDATE USING (true);

CREATE POLICY "Allow anon select assignments" ON public.incident_assignments FOR SELECT USING (true);
CREATE POLICY "Allow anon insert assignments" ON public.incident_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update assignments" ON public.incident_assignments FOR UPDATE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_assignments;

-- SEED DEMO RESOURCES
INSERT INTO public.resources (resource_id, name, department, resource_type, latitude, longitude, status, capability, distance, eta, match_score)
VALUES
  ('pol-p04', 'Police P14', 'police', 'police', 40.7180, -74.0010, 'available', '["Patrol", "Tactical", "Emergency Response"]'::jsonb, 1.1, 3, 98),
  ('pol-p01', 'Police P21', 'police', 'police', 40.7130, -74.0090, 'available', '["Patrol", "K9", "Investigation"]'::jsonb, 1.8, 5, 92),
  ('amb-a01', 'Ambulance A07', 'medical', 'ambulance', 40.7150, -74.0040, 'available', '["ALS", "Trauma", "Cardiac"]'::jsonb, 1.4, 4, 96),
  ('amb-a02', 'Ambulance A12', 'medical', 'ambulance', 40.7200, -74.0120, 'available', '["ALS", "Pediatric", "Transport"]'::jsonb, 2.3, 6, 88),
  ('fire-f01', 'Fire F03', 'fire', 'fire_truck', 40.7110, -74.0020, 'available', '["Suppression", "Technical Rescue", "Hazmat"]'::jsonb, 1.5, 4, 95),
  ('fire-f02', 'Fire F09', 'fire', 'fire_truck', 40.7250, -74.0150, 'available', '["Ladder", "High-Rise Suppression"]'::jsonb, 2.8, 7, 85),
  ('res-r01', 'Rescue R01', 'accident', 'rescue', 40.7140, -74.0080, 'available', '["Vehicle Extrication", "Heavy Rescue", "Confined Space"]'::jsonb, 1.6, 4, 94)
ON CONFLICT (resource_id) DO NOTHING;
