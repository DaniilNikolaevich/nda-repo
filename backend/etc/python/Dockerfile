FROM python:3.11-slim AS builder
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
WORKDIR /src
RUN apt-get update -y && apt-get install --no-install-recommends -y nano build-essential gcc libpq-dev python3-dev libjpeg-dev zlib1g-dev libglib2.0-dev libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libffi-dev libjpeg-dev libopenjp2-7-dev && rm -rf /var/lib/apt/lists/*
ADD ./etc/python/requirements.txt /src/
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /src/wheels -r requirements.txt

# итоговый образ
FROM python:3.11-slim AS runtime
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
WORKDIR /src/
RUN apt-get update -y && apt-get install --no-install-recommends -y nano build-essential gcc libpq-dev python3-dev libjpeg-dev zlib1g-dev libglib2.0-dev libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libffi-dev libjpeg-dev libopenjp2-7-dev &&  rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/wheels/ /wheels/
RUN pip install --no-cache /wheels/*
COPY --from=builder /src/requirements.txt /src/
COPY ./src/ /src/
COPY ./etc/python/gunicorn.conf.py /src/