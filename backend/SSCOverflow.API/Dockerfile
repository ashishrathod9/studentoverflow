# Use the official .NET 9.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the .NET 9.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy everything and restore dependencies
COPY . .

# Restore dependencies
RUN dotnet restore

# Build and publish the application
RUN dotnet publish -c Release -o /app/publish

# Final stage - copy the published app to the runtime image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Create a non-root user for security
RUN addgroup --system --gid 1001 dotnet && \
    adduser --system --uid 1001 --gid 1001 dotnet
USER dotnet

ENTRYPOINT ["dotnet", "SSCOverflow.API.dll"]