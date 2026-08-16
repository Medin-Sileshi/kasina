# SQL tally (Supabase)

Copy into the Supabase SQL editor. Replace placeholders:

- `:class_id` → text UUID of the pilot class  
- `:assignment_id` → text UUID of the week-1 assignment  

Weak-topic rules match M3: **≥3 attempts**, accuracy **&lt; 70%**, pooled class answers.

Alternatively (no SQL): teacher UI class results, or authenticated:

- `GET /classes/:id/results`
- `GET /classes/:id/weak-topics`

---

## 1. Join count (roster)

```sql
SELECT COUNT(*) AS joined_students
FROM class_members
WHERE class_id = ':class_id';
```

With names:

```sql
SELECT u.id, u.name, u.email, cm.joined_at
FROM class_members cm
JOIN "user" u ON u.id = cm.student_id
WHERE cm.class_id = ':class_id'
ORDER BY cm.joined_at;
```

---

## 2. Assignment completion rate

Students with **≥1 completed** `practice_sessions` row for the assignment / roster size.

```sql
WITH roster AS (
  SELECT student_id
  FROM class_members
  WHERE class_id = ':class_id'
),
done AS (
  SELECT DISTINCT ps.user_id
  FROM practice_sessions ps
  WHERE ps.assignment_id = ':assignment_id'
    AND ps.completed_at IS NOT NULL
    AND ps.user_id IN (SELECT student_id FROM roster)
)
SELECT
  (SELECT COUNT(*) FROM roster) AS roster_size,
  (SELECT COUNT(*) FROM done) AS students_done,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM done)
    / NULLIF((SELECT COUNT(*) FROM roster), 0),
    1
  ) AS completion_pct;
```

Per-student status (latest completed score):

```sql
SELECT
  u.name,
  u.email,
  CASE WHEN latest.id IS NULL THEN 'todo' ELSE 'done' END AS status,
  latest.score,
  latest.total,
  latest.completed_at
FROM class_members cm
JOIN "user" u ON u.id = cm.student_id
LEFT JOIN LATERAL (
  SELECT id, score, total, completed_at
  FROM practice_sessions ps
  WHERE ps.user_id = cm.student_id
    AND ps.assignment_id = ':assignment_id'
    AND ps.completed_at IS NOT NULL
  ORDER BY ps.completed_at DESC
  LIMIT 1
) latest ON TRUE
WHERE cm.class_id = ':class_id'
ORDER BY status, u.name;
```

---

## 3. Top class weak topics

Pooled answers from completed sessions of class members.

```sql
WITH member_sessions AS (
  SELECT ps.id
  FROM practice_sessions ps
  JOIN class_members cm ON cm.student_id = ps.user_id
  WHERE cm.class_id = ':class_id'
    AND ps.completed_at IS NOT NULL
),
topic_stats AS (
  SELECT
    q.unit,
    q.topic,
    COUNT(*) AS attempts,
    COUNT(*) FILTER (WHERE a.is_correct) AS correct
  FROM answers a
  JOIN questions q ON q.id = a.question_id
  WHERE a.session_id IN (SELECT id FROM member_sessions)
  GROUP BY q.unit, q.topic
)
SELECT
  unit,
  topic,
  attempts,
  correct,
  ROUND(100.0 * correct / attempts, 0) AS accuracy_pct
FROM topic_stats
WHERE attempts >= 3
  AND (correct::float / attempts) < 0.7
ORDER BY accuracy_pct ASC, attempts DESC
LIMIT 10;
```

---

## 4. Sessions completed per day

```sql
SELECT
  (ps.completed_at AT TIME ZONE 'Africa/Addis_Ababa')::date AS day,
  COUNT(*) AS completed_sessions
FROM practice_sessions ps
JOIN class_members cm ON cm.student_id = ps.user_id
WHERE cm.class_id = ':class_id'
  AND ps.completed_at IS NOT NULL
GROUP BY 1
ORDER BY 1;
```

---

## 5. Lookup IDs

Classes for a teacher email:

```sql
SELECT c.id, c.name, c.invite_code, c.created_at
FROM classes c
JOIN "user" u ON u.id = c.teacher_id
WHERE u.email = 'teacher@example.com'
ORDER BY c.created_at DESC;
```

Assignments for a class:

```sql
SELECT id, title, question_count, due_at, created_at
FROM assignments
WHERE class_id = ':class_id'
ORDER BY created_at DESC;
```
