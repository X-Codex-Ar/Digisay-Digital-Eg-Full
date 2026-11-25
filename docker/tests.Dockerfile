FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /src

COPY global.json ./
COPY backend/ ./backend/
RUN dotnet restore backend/DigiSay.sln --locked-mode

ENTRYPOINT ["dotnet"]
CMD ["test", "backend/DigiSay.sln", "--configuration", "Release", "--no-restore"]
