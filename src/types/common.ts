// src/types/common.ts

import { StockWeatherResponseDto } from './stock'; // Assuming StockWeatherResponseDto is in stock.ts

export interface ErrorResponseDto {
  error: string;
}

// Define an interface for your WebSocket gateway methods
export interface IEventsGateway {
  // Use 'I' prefix for interfaces is a common convention
  sendProcessingComplete(
    clientId: string,
    data: StockWeatherResponseDto | ErrorResponseDto,
  ): void;
}
