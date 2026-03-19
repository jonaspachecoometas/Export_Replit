FROM apache/superset:latest
USER root
RUN pip install psycopg2-binary && \
    sed -i 's/include-system-site-packages = false/include-system-site-packages = true/' /app/.venv/pyvenv.cfg
USER superset
