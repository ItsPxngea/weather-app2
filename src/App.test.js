import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WeatherApp from "./App";

const mockWeather = {
  location: "Cape Town",
  temp: 22,
  condition: "Sunny",
  humidity: 55,
  windSpeed: 10,
  precipitation: 0,
};

const mockForecast = [
  { date: "Mon 09 Jun", temp: 20, condition: "Cloudy", humidity: 60, windSpeed: 12 },
  { date: "Tue 10 Jun", temp: 18, condition: "Rain", humidity: 75, windSpeed: 15 },
];

const mockFetch = (responses) => {
  let callCount = 0;
  global.fetch = jest.fn(() => {
    const response = responses[callCount] ?? responses[responses.length - 1];
    callCount++;
    return Promise.resolve({
      ok: response.ok ?? true,
      json: async () => response.data,
    });
  });
};

beforeEach(() => {
  Object.defineProperty(global.navigator, "geolocation", {
    value: {
      getCurrentPosition: jest.fn((success) =>
        success({ coords: { latitude: -33.9258, longitude: 18.4232 } })
      ),
    },
    writable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("WeatherApp", () => {

  test("shows loading spinner on mount", () => {
    global.fetch = jest.fn(() => new Promise(() => { }));
    render(<WeatherApp />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  /*test("renders weather card after successful fetch", async () => {
    mockFetch([
      { data: mockWeather },
      { data: mockForecast },
    ]);

    render(<WeatherApp />);

    expect(await screen.findByText("Cape Town")).toBeInTheDocument();
    expect(await screen.findByText(/22/)).toBeInTheDocument();
    expect(await screen.findByText("Sunny")).toBeInTheDocument();
    expect(await screen.findByText("Cape Town")).toBeInTheDocument();
    expect(await screen.findByText("22°C")).toBeInTheDocument();
    expect(await screen.findByText("Sunny")).toBeInTheDocument();
    
  });*/

  test("renders forecast cards", async () => {
    mockFetch([
      { data: mockWeather },
      { data: mockForecast },
    ]);

    render(<WeatherApp />);

    expect(await screen.findByText("Mon 09 Jun")).toBeInTheDocument();
    expect(await screen.findByText("Tue 10 Jun")).toBeInTheDocument();
  });

  test("shows error banner for invalid city search", async () => {
    mockFetch([
      { data: mockWeather },
      { data: mockForecast },
      { ok: false, data: null },
    ]);

    render(<WeatherApp />);

    await screen.findByText("Cape Town");

    fireEvent.change(screen.getByPlaceholderText("Search city..."), {
      target: { value: "InvalidCity" },
    });
    fireEvent.click(screen.getByText("Search"));

    expect(await screen.findByText("Please enter a valid city name")).toBeInTheDocument();
  });

  test("clear button resets search result", async () => {
    mockFetch([
      { data: mockWeather },
      { data: mockForecast },
      { data: { ...mockWeather, location: "Johannesburg" } },
      { data: mockForecast },
      { data: mockForecast },
    ]);

    render(<WeatherApp />);

    await screen.findByText("Cape Town");

    fireEvent.change(screen.getByPlaceholderText("Search city..."), {
      target: { value: "Johannesburg" },
    });
    fireEvent.click(screen.getByText("Search"));

    await screen.findByText("Johannesburg");

    fireEvent.click(screen.getByText("Clear"));

    await waitFor(() => {
      expect(screen.queryByText("Johannesburg")).not.toBeInTheDocument();
    });
  });

  test("search input clears after clear button click", async () => {
    mockFetch([
      { data: mockWeather },
      { data: mockForecast },
      { data: { ...mockWeather, location: "London" } },
      { data: mockForecast },
      { data: mockForecast },
    ]);

    render(<WeatherApp />);

    await screen.findByText("Cape Town");

    const input = screen.getByPlaceholderText("Search city...");
    fireEvent.change(input, { target: { value: "London" } });
    fireEvent.click(screen.getByText("Search"));

    await screen.findByText("London");
    fireEvent.click(screen.getByText("Clear"));

    await waitFor(() => {
      expect(input.value).toBe("Cape Town");
    });
  });
});