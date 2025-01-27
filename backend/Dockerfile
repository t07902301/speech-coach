# syntax=docker/dockerfile:1.4
FROM --platform=$BUILDPLATFORM python:3.12.3 AS builder

RUN mkdir /backend
WORKDIR /backend
COPY requirements.txt /backend/requirements.txt
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]