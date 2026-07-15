# 07 — Developer Guide Documentation

**Tool:** Cursor  
**Phase:** Documentation  
**Date context:** Post-implementation onboarding

---

## Prompt

> Now I want you to create a document for me, that will help me to set up / debug and Explore the code and Also tell me steps to connect with Database and run the queries and also tell me about the packages which package is used for what purpose

---

## AI Response (summary)

Created `docs/DEVELOPER_GUIDE.md` covering:

1. First-time setup and daily workflow
2. Environment variables
3. Code organization and request flow
4. How to explore the codebase
5. Database connection options:
   - `psql` via Docker
   - Prisma Studio
   - GUI clients (TablePlus / DBeaver)
   - Sample SQL queries
6. Debugging backend, frontend, and DB
7. Full package reference (root / api / web)
8. Command cheat sheet

Linked from root `README.md`.

---

## Traceability

- Guide: `docs/DEVELOPER_GUIDE.md`
- README link section updated
