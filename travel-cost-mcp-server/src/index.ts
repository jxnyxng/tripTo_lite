#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// 타입 정의
interface CostLevel {
  budget: number;
  mid: number;
  luxury: number;
}

interface TransportCost {
  local: number;
  city: number;
  country: number;
}

interface CountryCost {
  accommodation: CostLevel;
  food: CostLevel;
  transport: TransportCost;
  activities: CostLevel;
  currency: string;
  exchangeRate: number;
  tips: string;
}

interface TravelCostData {
  [key: string]: CountryCost;
}

interface CalculateTravelCostArgs {
  destination: string;
  days: number;
  budget_level: 'budget' | 'mid' | 'luxury';
  travelers?: number;
}

interface GetDestinationInfoArgs {
  destination: string;
}

interface CompareDestinationsArgs {
  destinations: string[];
  days: number;
  budget_level: 'budget' | 'mid' | 'luxury';
}

// 여행 경비 데이터베이스 (실제 환경에서는 API나 DB에서 가져올 데이터)
const TRAVEL_COSTS: TravelCostData = {
  // 아시아 국가들
  '일본': {
    accommodation: { budget: 50000, mid: 120000, luxury: 300000 },
    food: { budget: 30000, mid: 60000, luxury: 150000 },
    transport: { local: 15000, city: 25000, country: 100000 },
    activities: { budget: 20000, mid: 50000, luxury: 120000 },
    currency: 'KRW',
    exchangeRate: 1,
    tips: '일본은 팁 문화가 없어 추가 비용 부담이 적습니다.'
  },
  '태국': {
    accommodation: { budget: 25000, mid: 80000, luxury: 250000 },
    food: { budget: 15000, mid: 35000, luxury: 80000 },
    transport: { local: 8000, city: 15000, country: 50000 },
    activities: { budget: 15000, mid: 40000, luxury: 100000 },
    currency: 'THB',
    exchangeRate: 0.027,
    tips: '태국은 물가가 저렴하여 예산 여행에 최적입니다.'
  },
  '베트남': {
    accommodation: { budget: 20000, mid: 60000, luxury: 180000 },
    food: { budget: 12000, mid: 25000, luxury: 60000 },
    transport: { local: 5000, city: 12000, country: 40000 },
    activities: { budget: 10000, mid: 30000, luxury: 80000 },
    currency: 'VND',
    exchangeRate: 0.041,
    tips: '베트남은 매우 저렴한 물가로 장기 여행에 적합합니다.'
  },
  '싱가포르': {
    accommodation: { budget: 80000, mid: 180000, luxury: 400000 },
    food: { budget: 40000, mid: 80000, luxury: 180000 },
    transport: { local: 20000, city: 30000, country: 50000 },
    activities: { budget: 30000, mid: 70000, luxury: 150000 },
    currency: 'SGD',
    exchangeRate: 920,
    tips: '싱가포르는 물가가 높지만 깨끗하고 안전한 여행지입니다.'
  },
  '말레이시아': {
    accommodation: { budget: 30000, mid: 70000, luxury: 200000 },
    food: { budget: 18000, mid: 40000, luxury: 90000 },
    transport: { local: 10000, city: 20000, country: 60000 },
    activities: { budget: 15000, mid: 35000, luxury: 90000 },
    currency: 'MYR',
    exchangeRate: 270,
    tips: '말레이시아는 합리적인 물가와 다양한 문화를 경험할 수 있습니다.'
  },
  '필리핀': {
    accommodation: { budget: 25000, mid: 65000, luxury: 180000 },
    food: { budget: 15000, mid: 30000, luxury: 70000 },
    transport: { local: 8000, city: 15000, country: 80000 },
    activities: { budget: 12000, mid: 35000, luxury: 85000 },
    currency: 'PHP',
    exchangeRate: 21,
    tips: '필리핀은 아름다운 해변과 저렴한 물가로 인기 있는 여행지입니다.'
  },
  '인도네시아': {
    accommodation: { budget: 22000, mid: 55000, luxury: 160000 },
    food: { budget: 12000, mid: 28000, luxury: 65000 },
    transport: { local: 7000, city: 18000, country: 70000 },
    activities: { budget: 10000, mid: 30000, luxury: 75000 },
    currency: 'IDR',
    exchangeRate: 0.067,
    tips: '인도네시아는 발리를 비롯해 다양한 섬들의 독특한 매력을 저렴하게 즐길 수 있습니다.'
  },
  // 유럽 국가들
  '프랑스': {
    accommodation: { budget: 80000, mid: 200000, luxury: 500000 },
    food: { budget: 50000, mid: 100000, luxury: 250000 },
    transport: { local: 25000, city: 40000, country: 150000 },
    activities: { budget: 40000, mid: 80000, luxury: 200000 },
    currency: 'EUR',
    exchangeRate: 1400,
    tips: '프랑스는 높은 물가이지만 풍부한 문화와 예술을 경험할 수 있습니다.'
  },
  '이탈리아': {
    accommodation: { budget: 70000, mid: 180000, luxury: 450000 },
    food: { budget: 45000, mid: 90000, luxury: 220000 },
    transport: { local: 20000, city: 35000, country: 120000 },
    activities: { budget: 35000, mid: 70000, luxury: 180000 },
    currency: 'EUR',
    exchangeRate: 1400,
    tips: '이탈리아는 역사적 유적지와 맛있는 음식으로 유명합니다.'
  },
  '스페인': {
    accommodation: { budget: 60000, mid: 150000, luxury: 380000 },
    food: { budget: 40000, mid: 80000, luxury: 180000 },
    transport: { local: 18000, city: 30000, country: 100000 },
    activities: { budget: 30000, mid: 60000, luxury: 150000 },
    currency: 'EUR',
    exchangeRate: 1400,
    tips: '스페인은 상대적으로 저렴한 유럽 여행지로 플라멩코와 축제 문화가 매력적입니다.'
  },
  // 미주 국가들
  '미국': {
    accommodation: { budget: 100000, mid: 250000, luxury: 600000 },
    food: { budget: 60000, mid: 120000, luxury: 300000 },
    transport: { local: 30000, city: 50000, country: 200000 },
    activities: { budget: 50000, mid: 100000, luxury: 250000 },
    currency: 'USD',
    exchangeRate: 1300,
    tips: '미국은 높은 물가이지만 다양한 경험과 광대한 자연을 만날 수 있습니다.'
  },
  '캐나다': {
    accommodation: { budget: 90000, mid: 220000, luxury: 550000 },
    food: { budget: 55000, mid: 110000, luxury: 270000 },
    transport: { local: 25000, city: 45000, country: 180000 },
    activities: { budget: 45000, mid: 90000, luxury: 220000 },
    currency: 'CAD',
    exchangeRate: 950,
    tips: '캐나다는 아름다운 자연경관과 안전한 여행 환경을 제공합니다.'
  }
};

class TravelCostServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'travel-cost-predictor',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // 에러 핸들링
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'calculate_travel_cost',
          description: '여행지별 정확한 경비를 계산합니다. 숙박, 식비, 교통비, 관광비를 포함한 상세한 예산을 제공합니다.',
          inputSchema: {
            type: 'object',
            properties: {
              destination: {
                type: 'string',
                description: '여행 목적지 (예: 일본, 태국, 프랑스)',
              },
              days: {
                type: 'number',
                description: '여행 일수',
              },
              budget_level: {
                type: 'string',
                enum: ['budget', 'mid', 'luxury'],
                description: '예산 수준 (budget: 저예산, mid: 중간예산, luxury: 고급)',
              },
              travelers: {
                type: 'number',
                description: '여행자 수',
                default: 1,
              },
            },
            required: ['destination', 'days', 'budget_level'],
          },
        },
        {
          name: 'get_destination_info',
          description: '여행지의 물가 정보와 여행 팁을 제공합니다.',
          inputSchema: {
            type: 'object',
            properties: {
              destination: {
                type: 'string',
                description: '여행 목적지',
              },
            },
            required: ['destination'],
          },
        },
        {
          name: 'compare_destinations',
          description: '여러 여행지의 경비를 비교합니다.',
          inputSchema: {
            type: 'object',
            properties: {
              destinations: {
                type: 'array',
                items: { type: 'string' },
                description: '비교할 여행지 목록',
              },
              days: {
                type: 'number',
                description: '여행 일수',
              },
              budget_level: {
                type: 'string',
                enum: ['budget', 'mid', 'luxury'],
                description: '예산 수준',
              },
            },
            required: ['destinations', 'days', 'budget_level'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const args = request.params.arguments as any;
      
      switch (request.params.name) {
        case 'calculate_travel_cost':
          return this.calculateTravelCost(args);
        case 'get_destination_info':
          return this.getDestinationInfo(args);
        case 'compare_destinations':
          return this.compareDestinations(args);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private calculateTravelCost(args: CalculateTravelCostArgs) {
    const { destination, days, budget_level, travelers = 1 } = args;

    if (!TRAVEL_COSTS[destination]) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `지원되지 않는 여행지입니다: ${destination}. 지원 가능한 여행지: ${Object.keys(TRAVEL_COSTS).join(', ')}`
      );
    }

    const costs = TRAVEL_COSTS[destination];
    const level = budget_level as 'budget' | 'mid' | 'luxury';

    // 일일 비용 계산
    const dailyAccommodation = costs.accommodation[level];
    const dailyFood = costs.food[level];
    const dailyTransport = costs.transport.local;
    const dailyActivities = costs.activities[level];

    // 총 비용 계산
    const totalAccommodation = dailyAccommodation * days * travelers;
    const totalFood = dailyFood * days * travelers;
    const totalTransport = dailyTransport * days * travelers;
    const totalActivities = dailyActivities * days * travelers;
    const totalCost = totalAccommodation + totalFood + totalTransport + totalActivities;

    // 항공료 추정 (목적지별 다름)
    const estimatedFlightCost = this.estimateFlightCost(destination) * travelers;

    const result = {
      destination,
      days,
      travelers,
      budget_level: level,
      currency: costs.currency,
      daily_breakdown: {
        accommodation: dailyAccommodation,
        food: dailyFood,
        transport: dailyTransport,
        activities: dailyActivities,
        daily_total: dailyAccommodation + dailyFood + dailyTransport + dailyActivities,
      },
      total_breakdown: {
        accommodation: totalAccommodation,
        food: totalFood,
        transport: totalTransport,
        activities: totalActivities,
        subtotal: totalCost,
        estimated_flight: estimatedFlightCost,
        grand_total: totalCost + estimatedFlightCost,
      },
      tips: costs.tips,
      formatted_total: `${(totalCost + estimatedFlightCost).toLocaleString()}원`,
    };

    return {
      content: [
        {
          type: 'text',
          text: `🧳 ${destination} 여행 경비 계산 결과\n\n` +
                `📅 여행 기간: ${days}일\n` +
                `👥 여행자 수: ${travelers}명\n` +
                `💰 예산 수준: ${level === 'budget' ? '저예산' : level === 'mid' ? '중간예산' : '고급'}\n\n` +
                `📊 일일 비용 (1인 기준):\n` +
                `🏨 숙박비: ${dailyAccommodation.toLocaleString()}원\n` +
                `🍽️ 식비: ${dailyFood.toLocaleString()}원\n` +
                `🚌 교통비: ${dailyTransport.toLocaleString()}원\n` +
                `🎭 관광비: ${dailyActivities.toLocaleString()}원\n` +
                `📍 일일 총계: ${result.daily_breakdown.daily_total.toLocaleString()}원\n\n` +
                `💵 전체 여행 비용:\n` +
                `🏨 총 숙박비: ${totalAccommodation.toLocaleString()}원\n` +
                `🍽️ 총 식비: ${totalFood.toLocaleString()}원\n` +
                `🚌 총 교통비: ${totalTransport.toLocaleString()}원\n` +
                `🎭 총 관광비: ${totalActivities.toLocaleString()}원\n` +
                `✈️ 항공료 (예상): ${estimatedFlightCost.toLocaleString()}원\n\n` +
                `🎯 **총 여행 경비: ${result.formatted_total}**\n\n` +
                `💡 ${costs.tips}`,
        },
      ],
    };
  }

  private getDestinationInfo(args: GetDestinationInfoArgs) {
    const { destination } = args;

    if (!TRAVEL_COSTS[destination]) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `지원되지 않는 여행지입니다: ${destination}`
      );
    }

    const costs = TRAVEL_COSTS[destination];

    return {
      content: [
        {
          type: 'text',
          text: `🌍 ${destination} 여행 정보\n\n` +
                `💱 통화: ${costs.currency}\n` +
                `📊 가격 범위 (1일 1인 기준):\n\n` +
                `🏨 숙박비:\n` +
                `   💚 저예산: ${costs.accommodation.budget.toLocaleString()}원\n` +
                `   💛 중간예산: ${costs.accommodation.mid.toLocaleString()}원\n` +
                `   💜 고급: ${costs.accommodation.luxury.toLocaleString()}원\n\n` +
                `🍽️ 식비:\n` +
                `   💚 저예산: ${costs.food.budget.toLocaleString()}원\n` +
                `   💛 중간예산: ${costs.food.mid.toLocaleString()}원\n` +
                `   💜 고급: ${costs.food.luxury.toLocaleString()}원\n\n` +
                `🚌 교통비:\n` +
                `   🚇 시내: ${costs.transport.local.toLocaleString()}원\n` +
                `   🚌 도시간: ${costs.transport.city.toLocaleString()}원\n` +
                `   🚄 장거리: ${costs.transport.country.toLocaleString()}원\n\n` +
                `💡 여행 팁: ${costs.tips}`,
        },
      ],
    };
  }

  private compareDestinations(args: CompareDestinationsArgs) {
    const { destinations, days, budget_level } = args;
    const level = budget_level as 'budget' | 'mid' | 'luxury';
    
    interface ComparisonResult {
      destination: string;
      error?: string;
      daily_cost?: number;
      total_cost?: number;
      flight_cost?: number;
      grand_total?: number;
      formatted_total?: string;
    }
    
    const comparisons: ComparisonResult[] = destinations.map((dest: string) => {
      if (!TRAVEL_COSTS[dest]) {
        return { destination: dest, error: '지원되지 않는 여행지' };
      }

      const costs = TRAVEL_COSTS[dest];
      const dailyTotal = costs.accommodation[level] + costs.food[level] + 
                        costs.transport.local + costs.activities[level];
      const totalCost = dailyTotal * days;
      const flightCost = this.estimateFlightCost(dest);
      const grandTotal = totalCost + flightCost;

      return {
        destination: dest,
        daily_cost: dailyTotal,
        total_cost: totalCost,
        flight_cost: flightCost,
        grand_total: grandTotal,
        formatted_total: `${grandTotal.toLocaleString()}원`,
      };
    });

    // 가격순 정렬
    const validComparisons = comparisons.filter((c: ComparisonResult) => !c.error);
    validComparisons.sort((a: ComparisonResult, b: ComparisonResult) => 
      (a.grand_total || 0) - (b.grand_total || 0)
    );

    let result = `🔍 여행지 경비 비교 (${days}일, ${level === 'budget' ? '저예산' : level === 'mid' ? '중간예산' : '고급'})\n\n`;
    
    validComparisons.forEach((comp: ComparisonResult, index: number) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
      result += `${medal} ${comp.destination}: ${comp.formatted_total}\n`;
      result += `   (현지비용: ${comp.total_cost?.toLocaleString()}원 + 항공료: ${comp.flight_cost?.toLocaleString()}원)\n\n`;
    });

    const errors = comparisons.filter((c: ComparisonResult) => c.error);
    if (errors.length > 0) {
      result += `❌ 지원되지 않는 여행지: ${errors.map((e: ComparisonResult) => e.destination).join(', ')}\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private estimateFlightCost(destination: string): number {
    // 간단한 항공료 추정 (실제로는 항공사 API 사용)
    const flightCosts: { [key: string]: number } = {
      '일본': 200000,
      '태국': 350000,
      '베트남': 300000,
      '싱가포르': 400000,
      '말레이시아': 380000,
      '필리핀': 320000,
      '인도네시아': 360000,
      '프랑스': 800000,
      '이탈리아': 750000,
      '스페인': 700000,
      '미국': 900000,
      '캐나다': 850000,
    };

    return flightCosts[destination] || 500000;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Travel Cost MCP Server running on stdio');
  }
}

const server = new TravelCostServer();
server.run().catch(console.error);
