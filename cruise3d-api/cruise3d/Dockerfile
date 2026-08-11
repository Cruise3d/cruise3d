# --- Build stage ---
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# copy csproj and restore
COPY ["cruise3d.API.csproj", "./"]
RUN dotnet restore

# copy everything and build
COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends libgssapi-krb5-2 \
	&& rm -rf /var/lib/apt/lists/*

# configure listening port in container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish/ ./

ENTRYPOINT ["dotnet", "cruise3d.API.dll"]
