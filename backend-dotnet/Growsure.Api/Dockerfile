FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Growsure.Api.csproj", "./"]
RUN dotnet restore "Growsure.Api.csproj"

# Copy all source files and publish
COPY . .
RUN dotnet publish "Growsure.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Growsure.Api.dll"]
