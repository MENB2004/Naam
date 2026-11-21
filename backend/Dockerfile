# ==========================================
# NAAM Backend Service - Production Dockerfile
# ==========================================
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast, reliable dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency specifications
COPY pyproject.toml uv.lock ./

# Install dependencies into virtualenv
RUN uv sync --frozen --no-dev

# ------------------------------------------
# Runner Stage
# ------------------------------------------
FROM python:3.12-slim AS runner

WORKDIR /app

# Install runtime dependencies (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root user
RUN groupadd -r naam && useradd -r -g naam -s /bin/false -d /app naamuser

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy backend application source
COPY --chown=naamuser:naam app /app/app
COPY --chown=naamuser:naam migrations /app/migrations
COPY --chown=naamuser:naam scripts /app/scripts
COPY --chown=naamuser:naam alembic.ini pyproject.toml /app/

USER naamuser

EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers", "--forwarded-allow-ips", "*"]
