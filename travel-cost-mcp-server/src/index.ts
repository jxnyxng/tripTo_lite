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

interface AccommodationTypes {
  호텔: CostLevel;
  게스트하우스: CostLevel;
  리조트: CostLevel;
  펜션: CostLevel;
}

interface TransportCost {
  local: number;
  city: number;
  country: number;
}

interface CountryCost {
  accommodation: AccommodationTypes;
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
  accommodation_type?: '호텔' | '게스트하우스' | '리조트' | '펜션';
  total_budget?: number; // 만원 단위
  spending_level?: '가성비 지출' | '적당히 지출' | '모두 지출';
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
    accommodation: {
      호텔: { budget: 60000, mid: 140000, luxury: 350000 },
      게스트하우스: { budget: 35000, mid: 80000, luxury: 150000 },
      리조트: { budget: 120000, mid: 250000, luxury: 500000 },
      펜션: { budget: 45000, mid: 100000, luxury: 200000 }
    },
    food: { budget: 30000, mid: 60000, luxury: 150000 },
    transport: { local: 15000, city: 25000, country: 100000 },
    activities: { budget: 20000, mid: 50000, luxury: 120000 },
    currency: 'KRW',
    exchangeRate: 1,
    tips: '일본은 팁 문화가 없어 추가 비용 부담이 적습니다.'
  },
  '태국': {
    accommodation: {
      호텔: { budget: 35000, mid: 90000, luxury: 280000 },
      게스트하우스: { budget: 18000, mid: 50000, luxury: 120000 },
      리조트: { budget: 60000, mid: 150000, luxury: 400000 },
      펜션: { budget: 25000, mid: 70000, luxury: 180000 }
    },
    food: { budget: 15000, mid: 35000, luxury: 80000 },
    transport: { local: 8000, city: 15000, country: 50000 },
    activities: { budget: 15000, mid: 40000, luxury: 100000 },
    currency: 'THB',
    exchangeRate: 0.027,
    tips: '태국은 물가가 저렴하여 예산 여행에 최적입니다.'
  },
  '베트남': {
    accommodation: {
      호텔: { budget: 28000, mid: 70000, luxury: 200000 },
      게스트하우스: { budget: 15000, mid: 40000, luxury: 100000 },
      리조트: { budget: 50000, mid: 120000, luxury: 300000 },
      펜션: { budget: 20000, mid: 55000, luxury: 150000 }
    },
    food: { budget: 12000, mid: 25000, luxury: 60000 },
    transport: { local: 5000, city: 12000, country: 40000 },
    activities: { budget: 10000, mid: 30000, luxury: 80000 },
    currency: 'VND',
    exchangeRate: 0.041,
    tips: '베트남은 매우 저렴한 물가로 장기 여행에 적합합니다.'
  },
  '싱가포르': {
    accommodation: {
      호텔: { budget: 100000, mid: 200000, luxury: 450000 },
      게스트하우스: { budget: 60000, mid: 120000, luxury: 250000 },
      리조트: { budget: 150000, mid: 300000, luxury: 600000 },
      펜션: { budget: 80000, mid: 160000, luxury: 350000 }
    },
    food: { budget: 40000, mid: 80000, luxury: 180000 },
    transport: { local: 20000, city: 30000, country: 50000 },
    activities: { budget: 30000, mid: 70000, luxury: 150000 },
    currency: 'SGD',
    exchangeRate: 920,
    tips: '싱가포르는 물가가 높지만 깨끗하고 안전한 여행지입니다.'
  },
  '말레이시아': {
    accommodation: {
      호텔: { budget: 40000, mid: 80000, luxury: 220000 },
      게스트하우스: { budget: 22000, mid: 50000, luxury: 120000 },
      리조트: { budget: 70000, mid: 150000, luxury: 350000 },
      펜션: { budget: 30000, mid: 65000, luxury: 180000 }
    },
    food: { budget: 18000, mid: 40000, luxury: 90000 },
    transport: { local: 10000, city: 20000, country: 60000 },
    activities: { budget: 15000, mid: 35000, luxury: 90000 },
    currency: 'MYR',
    exchangeRate: 270,
    tips: '말레이시아는 합리적인 물가와 다양한 문화를 경험할 수 있습니다.'
  },
  '필리핀': {
    accommodation: {
      호텔: { budget: 35000, mid: 75000, luxury: 200000 },
      게스트하우스: { budget: 18000, mid: 45000, luxury: 100000 },
      리조트: { budget: 60000, mid: 130000, luxury: 300000 },
      펜션: { budget: 25000, mid: 60000, luxury: 150000 }
    },
    food: { budget: 15000, mid: 30000, luxury: 70000 },
    transport: { local: 8000, city: 15000, country: 80000 },
    activities: { budget: 12000, mid: 35000, luxury: 85000 },
    currency: 'PHP',
    exchangeRate: 21,
    tips: '필리핀은 아름다운 해변과 저렴한 물가로 인기 있는 여행지입니다.'
  },
  '인도네시아': {
    accommodation: {
      호텔: { budget: 30000, mid: 65000, luxury: 180000 },
      게스트하우스: { budget: 16000, mid: 40000, luxury: 100000 },
      리조트: { budget: 50000, mid: 110000, luxury: 280000 },
      펜션: { budget: 22000, mid: 50000, luxury: 140000 }
    },
    food: { budget: 12000, mid: 28000, luxury: 65000 },
    transport: { local: 7000, city: 18000, country: 70000 },
    activities: { budget: 10000, mid: 30000, luxury: 75000 },
    currency: 'IDR',
    exchangeRate: 0.067,
    tips: '인도네시아는 발리를 비롯해 다양한 섬들의 독특한 매력을 저렴하게 즐길 수 있습니다.'
  },
  // 유럽 국가들
  '프랑스': {
    accommodation: {
      호텔: { budget: 100000, mid: 220000, luxury: 550000 },
      게스트하우스: { budget: 60000, mid: 140000, luxury: 300000 },
      리조트: { budget: 180000, mid: 350000, luxury: 700000 },
      펜션: { budget: 80000, mid: 180000, luxury: 400000 }
    },
    food: { budget: 50000, mid: 100000, luxury: 250000 },
    transport: { local: 25000, city: 40000, country: 150000 },
    activities: { budget: 40000, mid: 80000, luxury: 200000 },
    currency: 'EUR',
    exchangeRate: 1400,
    tips: '프랑스는 높은 물가이지만 풍부한 문화와 예술을 경험할 수 있습니다.'
  },
  '이탈리아': {
    accommodation: {
      호텔: { budget: 90000, mid: 200000, luxury: 500000 },
      게스트하우스: { budget: 50000, mid: 120000, luxury: 280000 },
      리조트: { budget: 150000, mid: 300000, luxury: 650000 },
      펜션: { budget: 70000, mid: 160000, luxury: 380000 }
    },
    food: { budget: 45000, mid: 90000, luxury: 220000 },
    transport: { local: 20000, city: 35000, country: 120000 },
    activities: { budget: 35000, mid: 70000, luxury: 180000 },
    currency: 'EUR',
    exchangeRate: 1400,
    tips: '이탈리아는 역사적 유적지와 맛있는 음식으로 유명합니다.'
  },
  '스페인': {
    accommodation: {
      호텔: { budget: 80000, mid: 170000, luxury: 420000 },
      게스트하우스: { budget: 45000, mid: 100000, luxury: 230000 },
      리조트: { budget: 120000, mid: 250000, luxury: 550000 },
      펜션: { budget: 60000, mid: 130000, luxury: 320000 }
    },
    food: { budget: 40000, mid: 80000, luxury: 180000 },
    transport: { local: 18000, city: 30000, country: 100000 },
    activities: { budget: 30000, mid: 60000, luxury: 150000 },
    currency: 'EUR',
    exchangeRate: 1400,
    tips: '스페인은 상대적으로 저렴한 유럽 여행지로 플라멩코와 축제 문화가 매력적입니다.'
  },
  // 미주 국가들
  '미국': {
    accommodation: {
      호텔: { budget: 120000, mid: 280000, luxury: 650000 },
      게스트하우스: { budget: 70000, mid: 150000, luxury: 350000 },
      리조트: { budget: 200000, mid: 400000, luxury: 800000 },
      펜션: { budget: 100000, mid: 220000, luxury: 500000 }
    },
    food: { budget: 60000, mid: 120000, luxury: 300000 },
    transport: { local: 30000, city: 50000, country: 200000 },
    activities: { budget: 50000, mid: 100000, luxury: 250000 },
    currency: 'USD',
    exchangeRate: 1300,
    tips: '미국은 높은 물가이지만 다양한 경험과 광대한 자연을 만날 수 있습니다.'
  },
  '캐나다': {
    accommodation: {
      호텔: { budget: 110000, mid: 240000, luxury: 580000 },
      게스트하우스: { budget: 65000, mid: 140000, luxury: 320000 },
      리조트: { budget: 180000, mid: 350000, luxury: 750000 },
      펜션: { budget: 90000, mid: 200000, luxury: 450000 }
    },
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
              accommodation_type: {
                type: 'string',
                enum: ['호텔', '게스트하우스', '리조트', '펜션'],
                description: '숙박 형태 (호텔, 게스트하우스, 리조트, 펜션)',
                default: '호텔',
              },
              total_budget: {
                type: 'number',
                description: '총 여행 예산 (만원 단위) - 지정시 예산 기반 계산',
              },
              spending_level: {
                type: 'string',
                enum: ['가성비 지출', '적당히 지출', '모두 지출'],
                description: '예산 내 지출 수준 (가성비: 절약형, 적당히: 균형형, 모두: 최대활용형)',
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
    const { 
      destination, 
      days, 
      budget_level, 
      travelers = 1, 
      accommodation_type = '호텔',
      total_budget,
      spending_level
    } = args;

    if (!TRAVEL_COSTS[destination]) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `지원되지 않는 여행지입니다: ${destination}. 지원 가능한 여행지: ${Object.keys(TRAVEL_COSTS).join(', ')}`
      );
    }

    const costs = TRAVEL_COSTS[destination];
    
    // 예산 기반 계산이 요청된 경우
    if (total_budget && spending_level) {
      return this.calculateWithBudget(destination, days, travelers, accommodation_type, total_budget, spending_level);
    }

    // 기존 방식의 계산
    const level = budget_level as 'budget' | 'mid' | 'luxury';

    // 일일 비용 계산 (숙박형태별 가격 적용)
    const dailyAccommodation = costs.accommodation[accommodation_type][level];
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
      accommodation_type,
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
                `🏨 숙박비 (숙박형태별 1일 기준):\n` +
                `   🏨 호텔: 💚${costs.accommodation.호텔.budget.toLocaleString()}원 💛${costs.accommodation.호텔.mid.toLocaleString()}원 💜${costs.accommodation.호텔.luxury.toLocaleString()}원\n` +
                `   🏠 게스트하우스: 💚${costs.accommodation.게스트하우스.budget.toLocaleString()}원 💛${costs.accommodation.게스트하우스.mid.toLocaleString()}원 💜${costs.accommodation.게스트하우스.luxury.toLocaleString()}원\n` +
                `   🏖️ 리조트: 💚${costs.accommodation.리조트.budget.toLocaleString()}원 💛${costs.accommodation.리조트.mid.toLocaleString()}원 💜${costs.accommodation.리조트.luxury.toLocaleString()}원\n` +
                `   🏡 펜션: �${costs.accommodation.펜션.budget.toLocaleString()}원 💛${costs.accommodation.펜션.mid.toLocaleString()}원 💜${costs.accommodation.펜션.luxury.toLocaleString()}원\n\n` +
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
      // 기본값으로 호텔 사용
      const dailyTotal = costs.accommodation.호텔[level] + costs.food[level] + 
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

  private calculateWithBudget(
    destination: string, 
    days: number, 
    travelers: number, 
    accommodation_type: '호텔' | '게스트하우스' | '리조트' | '펜션',
    total_budget: number, // 만원 단위
    spending_level: '가성비 지출' | '적당히 지출' | '모두 지출'
  ) {
    const costs = TRAVEL_COSTS[destination];
    const totalBudgetWon = total_budget * 10000; // 원 단위로 변환
    const estimatedFlightCost = this.estimateFlightCost(destination) * travelers;
    const availableBudget = totalBudgetWon - estimatedFlightCost; // 항공료 제외한 현지 예산

    if (availableBudget <= 0) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ 예산 부족: 입력하신 예산(${total_budget}만원)으로는 항공료(${estimatedFlightCost.toLocaleString()}원)만으로도 부족합니다.\n최소 ${Math.ceil((estimatedFlightCost + 100000) / 10000)}만원 이상의 예산이 필요합니다.`
          }
        ]
      };
    }

    // 최소 현지 비용 계산 (budget 레벨 기준)
    const minDailyAccommodation = costs.accommodation[accommodation_type].budget;
    const minDailyFood = costs.food.budget;
    const minDailyTransport = costs.transport.local;
    const minDailyActivities = costs.activities.budget;
    const minDailyTotal = minDailyAccommodation + minDailyFood + minDailyTransport + minDailyActivities;
    const minTotalCost = minDailyTotal * days * travelers;

    if (availableBudget < minTotalCost) {
      const requiredBudget = Math.ceil((estimatedFlightCost + minTotalCost) / 10000);
      return {
        content: [
          {
            type: 'text',
            text: `❌ 예산 부족: ${destination} ${days}일 여행을 위해서는 최소 ${requiredBudget}만원이 필요합니다.\n\n` +
                  `📊 최소 비용 분석:\n` +
                  `✈️ 항공료: ${estimatedFlightCost.toLocaleString()}원\n` +
                  `🏨 숙박비(budget): ${(minDailyAccommodation * days).toLocaleString()}원\n` +
                  `🍽️ 식비(budget): ${(minDailyFood * days).toLocaleString()}원\n` +
                  `🚌 교통비: ${(minDailyTransport * days).toLocaleString()}원\n` +
                  `🎭 관광비(budget): ${(minDailyActivities * days).toLocaleString()}원\n` +
                  `📍 총 최소 비용: ${(estimatedFlightCost + minTotalCost).toLocaleString()}원\n\n` +
                  `현재 예산: ${total_budget}만원 (${totalBudgetWon.toLocaleString()}원)\n` +
                  `부족 금액: ${((estimatedFlightCost + minTotalCost - totalBudgetWon) / 10000).toFixed(0)}만원`
          }
        ]
      };
    }

    // 지출 수준에 따른 예산 배분 비율
    const budgetRatios = {
      '가성비 지출': { accommodation: 0.3, food: 0.3, transport: 0.2, activities: 0.2 },
      '적당히 지출': { accommodation: 0.4, food: 0.25, transport: 0.15, activities: 0.2 },
      '모두 지출': { accommodation: 0.5, food: 0.2, transport: 0.1, activities: 0.2 }
    };

    const ratio = budgetRatios[spending_level];
    const accommodationBudget = availableBudget * ratio.accommodation;
    const foodBudget = availableBudget * ratio.food;
    const transportBudget = availableBudget * ratio.transport;
    const activitiesBudget = availableBudget * ratio.activities;

    // 일일 예산 계산
    const dailyAccommodationBudget = accommodationBudget / (days * travelers);
    const dailyFoodBudget = foodBudget / (days * travelers);
    const dailyTransportBudget = transportBudget / (days * travelers);
    const dailyActivitiesBudget = activitiesBudget / (days * travelers);

    // 예산에 맞는 최적 레벨 찾기
    const accommodationOptions = costs.accommodation[accommodation_type];
    const bestAccommodation = this.findBestOptionWithinBudget(accommodationOptions, dailyAccommodationBudget);
    const bestFood = this.findBestOptionWithinBudget(costs.food, dailyFoodBudget);
    const bestActivities = this.findBestOptionWithinBudget(costs.activities, dailyActivitiesBudget);

    // 실제 사용 비용 계산
    const actualDailyAccommodation = accommodationOptions[bestAccommodation.level];
    const actualDailyFood = costs.food[bestFood.level];
    const actualDailyTransport = Math.min(costs.transport.local, dailyTransportBudget);
    const actualDailyActivities = costs.activities[bestActivities.level];

    const actualDailyTotal = actualDailyAccommodation + actualDailyFood + actualDailyTransport + actualDailyActivities;
    const actualTotalCost = actualDailyTotal * days * travelers;
    const actualGrandTotal = actualTotalCost + estimatedFlightCost;

    const result = {
      destination,
      days,
      travelers,
      total_budget: total_budget,
      spending_level,
      accommodation_type,
      currency: costs.currency,
      budget_analysis: {
        total_budget_won: totalBudgetWon,
        flight_cost: estimatedFlightCost,
        available_budget: availableBudget,
        budget_distribution: {
          accommodation: Math.round(accommodationBudget),
          food: Math.round(foodBudget),
          transport: Math.round(transportBudget),
          activities: Math.round(activitiesBudget)
        }
      },
      selected_levels: {
        accommodation: bestAccommodation.level,
        food: bestFood.level,
        activities: bestActivities.level
      },
      daily_breakdown: {
        accommodation: actualDailyAccommodation,
        food: actualDailyFood,
        transport: actualDailyTransport,
        activities: actualDailyActivities,
        daily_total: actualDailyTotal
      },
      total_breakdown: {
        accommodation: actualDailyAccommodation * days * travelers,
        food: actualDailyFood * days * travelers,
        transport: actualDailyTransport * days * travelers,
        activities: actualDailyActivities * days * travelers,
        subtotal: actualTotalCost,
        estimated_flight: estimatedFlightCost,
        grand_total: actualGrandTotal
      },
      budget_remaining: totalBudgetWon - actualGrandTotal,
      tips: costs.tips
    };

    const spendingLevelText = {
      '가성비 지출': '💰 가성비 중심',
      '적당히 지출': '💵 적당한 수준',
      '모두 지출': '💸 최대한 활용'
    };

    return {
      content: [
        {
          type: 'text',
          text: `🎯 ${destination} 예산 맞춤 여행 계획 (${spendingLevelText[spending_level]})\n\n` +
                `💰 설정 예산: ${total_budget.toLocaleString()}만원 (${totalBudgetWon.toLocaleString()}원)\n` +
                `📅 여행 기간: ${days}일 ${travelers}명\n` +
                `🏨 숙박 형태: ${accommodation_type}\n\n` +
                `📊 예산 배분:\n` +
                `✈️ 항공료: ${estimatedFlightCost.toLocaleString()}원\n` +
                `🏨 숙박비: ${Math.round(accommodationBudget).toLocaleString()}원 (${bestAccommodation.level} 레벨)\n` +
                `🍽️ 식비: ${Math.round(foodBudget).toLocaleString()}원 (${bestFood.level} 레벨)\n` +
                `🚌 교통비: ${Math.round(transportBudget).toLocaleString()}원\n` +
                `🎭 관광비: ${Math.round(activitiesBudget).toLocaleString()}원 (${bestActivities.level} 레벨)\n\n` +
                `📍 일일 비용 (1인 기준):\n` +
                `🏨 숙박: ${actualDailyAccommodation.toLocaleString()}원\n` +
                `🍽️ 식사: ${actualDailyFood.toLocaleString()}원\n` +
                `🚌 교통: ${actualDailyTransport.toLocaleString()}원\n` +
                `🎭 관광: ${actualDailyActivities.toLocaleString()}원\n` +
                `📍 일일 총계: ${actualDailyTotal.toLocaleString()}원\n\n` +
                `💵 총 예상 비용: ${actualGrandTotal.toLocaleString()}원\n` +
                `💰 남은 예산: ${(totalBudgetWon - actualGrandTotal).toLocaleString()}원\n\n` +
                `💡 ${costs.tips}`
        }
      ]
    };
  }

  private findBestOptionWithinBudget(options: CostLevel, budget: number): {level: 'budget' | 'mid' | 'luxury', cost: number} {
    // 예산 내에서 가장 비싼 옵션 선택
    if (budget >= options.luxury) {
      return { level: 'luxury', cost: options.luxury };
    } else if (budget >= options.mid) {
      return { level: 'mid', cost: options.mid };
    } else {
      return { level: 'budget', cost: options.budget };
    }
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
