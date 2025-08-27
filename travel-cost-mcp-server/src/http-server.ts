import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MCP 서버와 통신하는 함수
async function callMCPServer(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // MCP 서버 프로세스 실행
    const mcpServer = spawn('node', [path.join(__dirname, 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    // 요청 데이터 준비
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };

    // 요청 전송
    mcpServer.stdin.write(JSON.stringify(request) + '\n');
    mcpServer.stdin.end();

    // 응답 수신
    mcpServer.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpServer.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpServer.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP Server exited with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        // 출력에서 JSON 응답 추출 (서버 시작 메시지 제외)
        const lines = output.split('\n').filter(line => line.trim());
        const jsonLine = lines.find(line => {
          try {
            const parsed = JSON.parse(line);
            return parsed.jsonrpc === '2.0';
          } catch {
            return false;
          }
        });

        if (jsonLine) {
          const response = JSON.parse(jsonLine);
          if (response.error) {
            reject(new Error(response.error.message || 'MCP Server error'));
          } else {
            resolve(response.result);
          }
        } else {
          reject(new Error('No valid JSON response from MCP server'));
        }
      } catch (error) {
        reject(new Error(`Failed to parse MCP response: ${error}`));
      }
    });

    mcpServer.on('error', (error) => {
      reject(new Error(`Failed to start MCP server: ${error}`));
    });
  });
}

// 라우트 정의

// 도구 목록 조회
app.get('/api/tools', async (req, res) => {
  try {
    const result = await callMCPServer('tools/list', {});
    res.json(result);
  } catch (error) {
    console.error('Tools list error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 여행 경비 계산
app.post('/api/calculate-cost', async (req, res) => {
  try {
    const { destination, days, budget_level, travelers = 1 } = req.body;

    // 입력값 검증
    if (!destination || !days || !budget_level) {
      return res.status(400).json({ 
        error: '필수 파라미터가 누락되었습니다: destination, days, budget_level' 
      });
    }

    if (!['budget', 'mid', 'luxury'].includes(budget_level)) {
      return res.status(400).json({ 
        error: 'budget_level은 budget, mid, luxury 중 하나여야 합니다' 
      });
    }

    const result = await callMCPServer('tools/call', {
      name: 'calculate_travel_cost',
      arguments: { destination, days, budget_level, travelers }
    });

    res.json(result);
  } catch (error) {
    console.error('Calculate cost error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 여행지 정보 조회
app.get('/api/destination/:destination', async (req, res) => {
  try {
    const { destination } = req.params;

    if (!destination) {
      return res.status(400).json({ error: '여행지를 지정해주세요' });
    }

    const result = await callMCPServer('tools/call', {
      name: 'get_destination_info',
      arguments: { destination: decodeURIComponent(destination) }
    });

    res.json(result);
  } catch (error) {
    console.error('Destination info error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 여행지 비교
app.post('/api/compare-destinations', async (req, res) => {
  try {
    const { destinations, days, budget_level } = req.body;

    // 입력값 검증
    if (!destinations || !Array.isArray(destinations) || !days || !budget_level) {
      return res.status(400).json({ 
        error: '필수 파라미터가 누락되었습니다: destinations (array), days, budget_level' 
      });
    }

    if (!['budget', 'mid', 'luxury'].includes(budget_level)) {
      return res.status(400).json({ 
        error: 'budget_level은 budget, mid, luxury 중 하나여야 합니다' 
      });
    }

    const result = await callMCPServer('tools/call', {
      name: 'compare_destinations',
      arguments: { destinations, days, budget_level }
    });

    res.json(result);
  } catch (error) {
    console.error('Compare destinations error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Travel Cost HTTP API Server is running',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Travel Cost HTTP API Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/tools - List available tools`);
  console.log(`   POST /api/calculate-cost - Calculate travel cost`);
  console.log(`   GET  /api/destination/:destination - Get destination info`);
  console.log(`   POST /api/compare-destinations - Compare destinations`);
});
