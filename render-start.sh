#!/bin/sh
# Sobe a API em segundo plano e o app Next.js em primeiro plano.
cd /app/api && dotnet DrivePulse.Api.dll &
cd /app/web && exec node server.js
