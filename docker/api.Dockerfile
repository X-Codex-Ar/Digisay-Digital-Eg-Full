FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY global.json ./
COPY backend/ ./backend/
RUN --mount=type=cache,id=digisay-nuget,target=/root/.nuget/packages \
    dotnet restore backend/src/DigiSay.API/DigiSay.API.csproj --locked-mode && \
    dotnet publish backend/src/DigiSay.API/DigiSay.API.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_HTTP_PORTS=5080
EXPOSE 5080
ENTRYPOINT ["dotnet", "DigiSay.API.dll"]
