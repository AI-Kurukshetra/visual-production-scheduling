# Schema

## 2026-03-14

### ai_recommendations
- Columns: id uuid pk, facility_id uuid fk -> facilities, title text, action text, impact text, eta text, confidence numeric(5,2), created_at timestamptz
- Indexes: idx_ai_recommendations_facility_id, idx_ai_recommendations_created_at
- RLS: enabled
- Policies:
  - ai_recommendations_read: select using (true)
