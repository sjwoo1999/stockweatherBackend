// stockweather-backend/src/users/users.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    NotFoundException, // Make sure this is imported
    ConflictException,  // Make sure this is imported
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { Request } from 'express';
  import { StockData } from '../types/stock';
  import { User } from './user.entity'; // Ensure User entity is imported for type hinting
  
  @Controller('users')
  export class UsersController {
    constructor(private usersService: UsersService) {}
  
    // 🚨 FIX 1: Add or rename the endpoint to 'me' to match frontend request
    @Get('me') // This will handle GET /users/me requests
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req): Promise<User> {
      // req.user contains the User entity object populated by JwtStrategy
      // after successful authentication.
      return req.user;
    }
  
    // If you also had a separate /users/profile endpoint and want to keep it,
    // you can add it back, but 'me' is typically preferred for the authenticated user's profile.
    /*
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getOldProfile(@Req() req) {
      return req.user;
    }
    */
  
    @Post('favorites')
    @UseGuards(JwtAuthGuard)
    async addFavorite(@Req() req, @Body('stockName') stockName: string) {
      const user = await this.usersService.addFavoriteStock(req.user.id, stockName);
      return { message: `${stockName}이(가) 관심 종목에 추가되었습니다.`, favorites: user.favoriteStocks };
    }
  
    @Delete('favorites/:stockName')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeFavorite(@Req() req, @Param('stockName') stockName: string) {
      await this.usersService.removeFavoriteStock(req.user.id, stockName);
    }
  
    @Get('favorites')
    @UseGuards(JwtAuthGuard)
    async getFavorites(@Req() req) {
      const user = await this.usersService.findById(req.user.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return { favorites: user.favoriteStocks };
    }
  
    @Get('summary')
    @UseGuards(JwtAuthGuard)
    async getUserSummary(@Req() req): Promise<any[]> {
      return this.usersService.getMockUserSummary(req.user.id);
    }
  
    @Get('detail')
    @UseGuards(JwtAuthGuard)
    async getUserDetail(@Req() req): Promise<StockData[]> {
      return this.usersService.getMockUserDetail(req.user.id);
    }
  }