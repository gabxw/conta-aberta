FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY NuGet.Config ./
COPY DrivePulse.Api/DrivePulse.Api.csproj DrivePulse.Api/
RUN dotnet restore DrivePulse.Api/DrivePulse.Api.csproj
COPY DrivePulse.Api/ DrivePulse.Api/
RUN dotnet publish DrivePulse.Api/DrivePulse.Api.csproj -c Release -o /app/publish --no-restore
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER app
ENTRYPOINT ["dotnet", "DrivePulse.Api.dll"]
