-- ============================================
-- NIUMBA - Function to count properties by city
-- Optimized for performance
-- ============================================

-- Create a function to get property counts by city
CREATE OR REPLACE FUNCTION get_city_property_counts()
RETURNS TABLE (
  city TEXT,
  province TEXT,
  property_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.city,
    p.province,
    COUNT(*)::BIGINT as property_count
  FROM properties p
  WHERE p.status = 'active'
    AND p.city IS NOT NULL
  GROUP BY p.city, p.province
  ORDER BY property_count DESC, p.city;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_city_property_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_city_property_counts() TO anon;

