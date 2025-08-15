import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Cloud, Droplets, Sun, Wind } from "lucide-react"

// TypeScript interfaces
interface ForecastDay {
  day: string;
  temperature: number;
  weatherDescription: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherDescription: string;
  forecast: ForecastDay[];
}

// Weather icon mapping function
const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('sun') || desc.includes('clear')) return <Sun className="h-6 w-6 text-yellow-500" />;
  if (desc.includes('rain') || desc.includes('shower')) return <Droplets className="h-6 w-6 text-blue-500" />;
  return <Cloud className="h-6 w-6 text-gray-500" />;
};

export default function WeatherDashboard() {
  // Mock data - in a real app, this would come from an API
  const weatherData: WeatherData = {
    location: "New York",
    temperature: 72,
    humidity: 65,
    windSpeed: 8,
    weatherDescription: "Partly Cloudy",
    forecast: [
      { day: "Monday", temperature: 75, weatherDescription: "Sunny" },
      { day: "Tuesday", temperature: 70, weatherDescription: "Partly Cloudy" },
      { day: "Wednesday", temperature: 68, weatherDescription: "Rain Showers" },
      { day: "Thursday", temperature: 72, weatherDescription: "Cloudy" },
      { day: "Friday", temperature: 76, weatherDescription: "Sunny" }
    ]
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{weatherData.location} Weather</h1>
        <div className="flex items-center mt-2">
          <div className="text-5xl font-bold">{weatherData.temperature}°F</div>
          <Badge variant="outline" className="ml-4 text-lg py-1">
            {weatherData.weatherDescription}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Current Conditions</CardTitle>
            <CardDescription>As of {new Date().toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                  <span>Humidity</span>
                </div>
                <span className="font-medium">{weatherData.humidity}%</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wind className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Wind Speed</span>
                </div>
                <span className="font-medium">{weatherData.windSpeed} mph</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getWeatherIcon(weatherData.weatherDescription)}
                  <span className="ml-2">Conditions</span>
                </div>
                <span className="font-medium">{weatherData.weatherDescription}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5-Day Forecast */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
            <CardDescription>Weather outlook for the week ahead</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {weatherData.forecast.map((day, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="flex flex-col items-center">
                      {getWeatherIcon(day.weatherDescription)}
                      <div className="mt-2 text-2xl font-bold">{day.temperature}°F</div>
                      <div className="text-xs text-muted-foreground mt-1">{day.weatherDescription}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}